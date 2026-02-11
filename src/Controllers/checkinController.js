const User = require("../Models/userRegisterModel");
const Venue = require("../Models/venueModel");
const VenuePresence = require("../Models/venuPresence");

// CHECK IN TO VENUE (user arrives at a venue)
const checkIn = async function (req, res) {
  try {
    let userId = req.user.userId;
    let { venueId } = req.body;

    if (!venueId) return res.status(400).send({ status: false, message: "venueId required" });

    let venue = await Venue.findOne({ _id: venueId, isActive: true, isDeleted: false });
    if (!venue) return res.status(404).send({ status: false, message: "venue not found or inactive" });

    // Update user's active venue
    let user = await User.findByIdAndUpdate(
      userId,
      { activeVenueId: venueId, lastActiveAt: new Date() },
      { new: true }
    ).select("-password -swipedRight -swipedLeft -blockedUsers");

    // Create/update venue presence (TTL: 4 hours)
    await VenuePresence.findOneAndUpdate(
      { userId },
      {
        userId,
        venueId,
        lastSeenAt: new Date(),
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000)
      },
      { upsert: true, new: true }
    );

    // Update venue occupancy
    let occupancy = await VenuePresence.countDocuments({ venueId });
    await Venue.findByIdAndUpdate(venueId, { currentOccupancy: occupancy });

    return res.status(200).send({
      status: true,
      message: `checked in to ${venue.name}`,
      data: {
        venue: {
          _id: venue._id,
          name: venue.name,
          type: venue.type,
          city: venue.city,
          currentOccupancy: occupancy
        },
        user: {
          _id: user._id,
          name: user.name,
          activeVenueId: user.activeVenueId
        }
      }
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// CHECK OUT FROM VENUE (user leaves)
const checkOut = async function (req, res) {
  try {
    let userId = req.user.userId;

    let user = await User.findById(userId);
    if (!user) return res.status(404).send({ status: false, message: "user not found" });

    let previousVenueId = user.activeVenueId;

    // Clear user's active venue
    user.activeVenueId = null;
    user.lastActiveAt = new Date();
    await user.save();

    // Remove venue presence
    await VenuePresence.deleteOne({ userId });

    // Update venue occupancy
    if (previousVenueId) {
      let occupancy = await VenuePresence.countDocuments({ venueId: previousVenueId });
      await Venue.findByIdAndUpdate(previousVenueId, { currentOccupancy: occupancy });
    }

    // Reset swipe history for fresh start at next venue
    user.swipedRight = [];
    user.swipedLeft = [];
    await user.save();

    return res.status(200).send({
      status: true,
      message: "checked out - swipes reset for next venue",
      data: { activeVenueId: null }
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// HEARTBEAT (keep presence alive while at venue)
const heartbeat = async function (req, res) {
  try {
    let userId = req.user.userId;
    let user = await User.findById(userId);
    if (!user || !user.activeVenueId) {
      return res.status(200).send({ status: true, message: "not at venue", data: { activeVenueId: null } });
    }

    // Refresh presence TTL
    await VenuePresence.findOneAndUpdate(
      { userId },
      { lastSeenAt: new Date(), expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000) }
    );

    user.lastActiveAt = new Date();
    await user.save();

    return res.status(200).send({
      status: true,
      message: "heartbeat ok",
      data: { activeVenueId: user.activeVenueId }
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// GET NEARBY VENUES (for user to check in)
const getNearbyVenues = async function (req, res) {
  try {
    let { lat, lng, radius } = req.query;

    let filter = { isActive: true, isDeleted: false };

    // If geolocation provided, use $near
    if (lat && lng) {
      filter.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius) || 5000
        }
      };
    }

    let venues;
    try {
      venues = await Venue.find(filter)
        .select("name type description city state addressLine1 images tags currentOccupancy capacity location operatingHours")
        .limit(50);
    } catch (geoErr) {
      // Fallback if geo index not ready
      delete filter.location;
      venues = await Venue.find(filter)
        .select("name type description city state addressLine1 images tags currentOccupancy capacity location operatingHours")
        .limit(50);
    }

    return res.status(200).send({ status: true, message: "venues", data: venues });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// GET VENUE PEOPLE COUNT
const getVenuePeopleCount = async function (req, res) {
  try {
    let { venueId } = req.params;
    let count = await VenuePresence.countDocuments({ venueId });
    return res.status(200).send({ status: true, message: "people count", data: { count } });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { checkIn, checkOut, heartbeat, getNearbyVenues, getVenuePeopleCount };
