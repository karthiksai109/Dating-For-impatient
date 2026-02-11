const EphemeralMatch = require("../Models/ephemeralMatch");
const EphemeralMessage = require("../Models/ephemeralMessage");
const User = require("../Models/userRegisterModel");

// SEND MESSAGE (venue-locked: both users must be at same venue)
const sendMessage = async function (req, res) {
  try {
    let userId = req.user.userId;
    let { matchId, text } = req.body;

    if (!matchId) return res.status(400).send({ status: false, message: "matchId required" });
    if (!text || !text.trim()) return res.status(400).send({ status: false, message: "message text required" });

    let match = await EphemeralMatch.findById(matchId);
    if (!match) return res.status(404).send({ status: false, message: "match not found or expired" });

    // Verify sender is part of match
    if (!match.users.map(u => u.toString()).includes(userId)) {
      return res.status(403).send({ status: false, message: "you are not part of this match" });
    }

    // Verify both users are still at the same venue
    let sender = await User.findById(userId);
    let otherUserId = match.users.find(u => u.toString() !== userId);
    let otherUser = await User.findById(otherUserId);

    if (!sender || !otherUser) {
      return res.status(404).send({ status: false, message: "user not found" });
    }

    if (!sender.activeVenueId || !otherUser.activeVenueId) {
      return res.status(400).send({ 
        status: false, 
        message: "messaging is only available when both users are at the same venue" 
      });
    }

    if (sender.activeVenueId.toString() !== otherUser.activeVenueId.toString()) {
      return res.status(400).send({ 
        status: false, 
        message: "messaging is only available when both users are at the same venue" 
      });
    }

    if (sender.activeVenueId.toString() !== match.venueId.toString()) {
      return res.status(400).send({ 
        status: false, 
        message: "you must be at the venue where you matched to chat" 
      });
    }

    let message = await EphemeralMessage.create({
      matchId: match._id,
      from: userId,
      text: text.trim(),
      expiresAt: match.expiresAt
    });

    return res.status(201).send({
      status: true,
      message: "message sent",
      data: {
        _id: message._id,
        matchId: message.matchId,
        from: userId,
        text: message.text,
        createdAt: message.createdAt
      }
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// GET MESSAGES FOR A MATCH (venue-locked)
const getMessages = async function (req, res) {
  try {
    let userId = req.user.userId;
    let { matchId } = req.params;

    if (!matchId) return res.status(400).send({ status: false, message: "matchId required" });

    let match = await EphemeralMatch.findById(matchId);
    if (!match) return res.status(404).send({ status: false, message: "match not found or expired" });

    if (!match.users.map(u => u.toString()).includes(userId)) {
      return res.status(403).send({ status: false, message: "you are not part of this match" });
    }

    // Check venue lock
    let sender = await User.findById(userId);
    if (!sender.activeVenueId || sender.activeVenueId.toString() !== match.venueId.toString()) {
      return res.status(400).send({ 
        status: false, 
        message: "you must be at the venue to view messages" 
      });
    }

    let messages = await EphemeralMessage.find({ matchId })
      .populate("from", "name photos")
      .sort({ createdAt: 1 });

    return res.status(200).send({
      status: true,
      message: "messages",
      data: messages
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// GET MY CHAT LIST (active ephemeral matches with last message)
const getMyChatList = async function (req, res) {
  try {
    let userId = req.user.userId;
    let user = await User.findById(userId);
    if (!user) return res.status(404).send({ status: false, message: "user not found" });

    let filter = { users: userId };
    if (user.activeVenueId) {
      filter.venueId = user.activeVenueId;
    }

    let matches = await EphemeralMatch.find(filter)
      .populate("users", "name photos activeVenueId")
      .populate("venueId", "name type")
      .sort({ createdAt: -1 });

    let chatList = [];
    for (let m of matches) {
      let otherUser = m.users.find(u => u._id.toString() !== userId);
      let lastMsg = await EphemeralMessage.findOne({ matchId: m._id })
        .sort({ createdAt: -1 })
        .select("text from createdAt");

      let canChat = otherUser && otherUser.activeVenueId && 
        user.activeVenueId && 
        otherUser.activeVenueId.toString() === user.activeVenueId.toString();

      chatList.push({
        matchId: m._id,
        venue: m.venueId,
        otherUser: otherUser ? { _id: otherUser._id, name: otherUser.name, photos: otherUser.photos } : null,
        lastMessage: lastMsg,
        canChat,
        expiresAt: m.expiresAt
      });
    }

    return res.status(200).send({ status: true, message: "chat list", data: chatList });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { sendMessage, getMessages, getMyChatList };
