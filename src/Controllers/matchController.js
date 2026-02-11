const User = require("../Models/userRegisterModel");
const Match = require("../Models/matchModel");
const EphemeralMatch = require("../Models/ephemeralMatch");
const VenuePresence = require("../Models/venuPresence");

// GET PROFILES AT CURRENT VENUE (venue-locked discovery)
const getVenueProfiles = async function (req, res) {
  try {
    let userId = req.user.userId;
    let user = await User.findById(userId);
    if (!user) return res.status(404).send({ status: false, message: "user not found" });
    if (!user.activeVenueId) return res.status(400).send({ status: false, message: "you are not checked into any venue" });

    // Get all users at the same venue, excluding self, blocked, already swiped
    let excludeIds = [userId, ...user.swipedRight, ...user.swipedLeft, ...user.blockedUsers];

    let filter = {
      _id: { $nin: excludeIds },
      activeVenueId: user.activeVenueId,
      role: "user",
      status: "Active"
    };

    // Gender preference filter
    if (user.interestedIn && user.interestedIn !== "everyone") {
      filter.gender = user.interestedIn;
    }

    let profiles = await User.find(filter)
      .select("name age gender bio hobbies interests photos privacySettings activeVenueId")
      .limit(50);

    // Apply privacy: strip email/phone (they're already not selected, but ensure)
    let safeProfiles = profiles.map(p => {
      let obj = p.toObject();
      // Never expose email or phone to other users
      delete obj.email;
      delete obj.phone;
      // Respect privacy settings
      if (!obj.privacySettings?.showAge) delete obj.age;
      if (!obj.privacySettings?.showBio) delete obj.bio;
      delete obj.privacySettings;
      return obj;
    });

    // Calculate interest match scores
    let myInterests = [...(user.hobbies || []), ...(user.interests || [])].map(i => i.toLowerCase());
    safeProfiles = safeProfiles.map(p => {
      let theirInterests = [...(p.hobbies || []), ...(p.interests || [])].map(i => i.toLowerCase());
      let common = myInterests.filter(i => theirInterests.includes(i));
      return {
        ...p,
        matchScore: myInterests.length > 0 ? Math.round((common.length / myInterests.length) * 100) : 0,
        commonInterests: common
      };
    });

    // Sort by match score (best matches first)
    safeProfiles.sort((a, b) => b.matchScore - a.matchScore);

    return res.status(200).send({
      status: true,
      message: "venue profiles",
      data: safeProfiles,
      venueId: user.activeVenueId
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// SWIPE RIGHT (like)
const swipeRight = async function (req, res) {
  try {
    let userId = req.user.userId;
    let { targetUserId } = req.body;
    if (!targetUserId) return res.status(400).send({ status: false, message: "targetUserId required" });

    let user = await User.findById(userId);
    if (!user) return res.status(404).send({ status: false, message: "user not found" });
    if (!user.activeVenueId) return res.status(400).send({ status: false, message: "not checked into a venue" });

    let target = await User.findById(targetUserId);
    if (!target) return res.status(404).send({ status: false, message: "target user not found" });

    // Must be at same venue
    if (!target.activeVenueId || target.activeVenueId.toString() !== user.activeVenueId.toString()) {
      return res.status(400).send({ status: false, message: "target user is not at your venue" });
    }

    // Add to swiped right
    if (!user.swipedRight.includes(targetUserId)) {
      user.swipedRight.push(targetUserId);
      await user.save();
    }

    // Check if mutual match
    let isMatch = target.swipedRight.includes(userId);

    if (isMatch) {
      // Create match
      let existingMatch = await Match.findOne({
        users: { $all: [userId, targetUserId] },
        venueId: user.activeVenueId
      });

      if (!existingMatch) {
        let match = await Match.create({
          users: [userId, targetUserId],
          venueId: user.activeVenueId,
          howMatched: "swipe",
          matchedAt: new Date()
        });

        // Create ephemeral match (expires when both leave venue)
        let ephemeral = await EphemeralMatch.create({
          venueId: user.activeVenueId,
          users: [userId, targetUserId],
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h TTL
        });

        return res.status(200).send({
          status: true,
          message: "it's a match!",
          data: {
            matched: true,
            matchId: match._id,
            ephemeralMatchId: ephemeral._id,
            matchedUser: {
              _id: target._id,
              name: target.name,
              photos: target.photos,
              bio: target.bio
            }
          }
        });
      }
    }

    return res.status(200).send({
      status: true,
      message: "liked",
      data: { matched: false }
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// SWIPE LEFT (pass)
const swipeLeft = async function (req, res) {
  try {
    let userId = req.user.userId;
    let { targetUserId } = req.body;
    if (!targetUserId) return res.status(400).send({ status: false, message: "targetUserId required" });

    let user = await User.findById(userId);
    if (!user) return res.status(404).send({ status: false, message: "user not found" });

    if (!user.swipedLeft.includes(targetUserId)) {
      user.swipedLeft.push(targetUserId);
      await user.save();
    }

    return res.status(200).send({ status: true, message: "passed" });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// GET MY MATCHES (only active venue matches)
const getMyMatches = async function (req, res) {
  try {
    let userId = req.user.userId;
    let user = await User.findById(userId);
    if (!user) return res.status(404).send({ status: false, message: "user not found" });

    let filter = { users: userId };
    
    // If at a venue, show only that venue's matches
    if (user.activeVenueId) {
      filter.venueId = user.activeVenueId;
    }

    let matches = await Match.find(filter)
      .populate("users", "name photos bio age gender hobbies interests activeVenueId")
      .populate("venueId", "name type city")
      .sort({ matchedAt: -1 });

    // Filter out self from users array and apply privacy
    let result = matches.map(m => {
      let obj = m.toObject();
      obj.matchedUser = obj.users.find(u => u._id.toString() !== userId);
      delete obj.users;
      // Check if matched user is still at venue
      if (obj.matchedUser) {
        obj.canChat = obj.matchedUser.activeVenueId && 
          user.activeVenueId && 
          obj.matchedUser.activeVenueId.toString() === user.activeVenueId.toString();
      } else {
        obj.canChat = false;
      }
      return obj;
    });

    return res.status(200).send({ status: true, message: "matches", data: result });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// GET ALL MY MATCHES (across all venues)
const getAllMyMatches = async function (req, res) {
  try {
    let userId = req.user.userId;
    let user = await User.findById(userId);
    if (!user) return res.status(404).send({ status: false, message: "user not found" });

    let matches = await Match.find({ users: userId })
      .populate("users", "name photos bio age gender hobbies interests activeVenueId")
      .populate("venueId", "name type city")
      .sort({ matchedAt: -1 });

    let result = matches.map(m => {
      let obj = m.toObject();
      obj.matchedUser = obj.users.find(u => u._id.toString() !== userId);
      delete obj.users;
      if (obj.matchedUser) {
        obj.canChat = obj.matchedUser.activeVenueId && 
          user.activeVenueId && 
          obj.matchedUser.activeVenueId.toString() === user.activeVenueId.toString();
      } else {
        obj.canChat = false;
      }
      return obj;
    });

    return res.status(200).send({ status: true, message: "all matches", data: result });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// BLOCK USER
const blockUser = async function (req, res) {
  try {
    let userId = req.user.userId;
    let { targetUserId } = req.body;
    if (!targetUserId) return res.status(400).send({ status: false, message: "targetUserId required" });

    await User.findByIdAndUpdate(userId, { $addToSet: { blockedUsers: targetUserId } });

    return res.status(200).send({ status: true, message: "user blocked" });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// UNBLOCK USER
const unblockUser = async function (req, res) {
  try {
    let userId = req.user.userId;
    let { targetUserId } = req.body;
    if (!targetUserId) return res.status(400).send({ status: false, message: "targetUserId required" });

    await User.findByIdAndUpdate(userId, { $pull: { blockedUsers: targetUserId } });

    return res.status(200).send({ status: true, message: "user unblocked" });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = {
  getVenueProfiles,
  swipeRight,
  swipeLeft,
  getMyMatches,
  getAllMyMatches,
  blockUser,
  unblockUser
};
