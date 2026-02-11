// controllers/venueController.js

const Venue = require("../Models/venueModel");

/** ✅ CREATE VENUE */
const createVenue = async function (req, res) {
  try {
    let data = req.body;
    if (!data) return res.status(400).send({ status: false, message: "please enter all fields..." });

    let {
      name,
      ownerName,
      ownerEmail,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      zip,
      country,
      capacity,
      pricePerHour,
      images,
      tags,
      isActive
    } = data;

    if (!name) return res.status(400).send({ status: false, message: "venue name is required" });

    // optional small validations (your style)
    if (ownerEmail && !ownerEmail.includes("@"))
      return res.status(400).send({ status: false, message: "please enter valid owner email" });

    if (capacity && Number(capacity) < 0)
      return res.status(400).send({ status: false, message: "capacity should be >= 0" });

    if (pricePerHour && Number(pricePerHour) < 0)
      return res.status(400).send({ status: false, message: "pricePerHour should be >= 0" });

    // if you store adminId from middleware like req.user.adminId
    let createdBy = req.user?.adminId || req.user?._id;

    let venue = await Venue.create({
      name: name.trim(),
      ownerName,
      ownerEmail: ownerEmail ? ownerEmail.toLowerCase() : "",
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      zip,
      country: country || "USA",
      capacity: capacity || 0,
      pricePerHour: pricePerHour || 0,
      images: images || [],
      tags: tags || [],
      isActive: typeof isActive === "boolean" ? isActive : true,
      createdBy
    });

    return res.status(201).send({ status: true, message: "venue created", data: venue });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

/** ✅ GET ALL VENUES (search + status filter + pagination) */
const getVenues = async function (req, res) {
  try {
    let { search, status, page, limit } = req.query;

    page = page ? Number(page) : 1;
    limit = limit ? Number(limit) : 10;

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 50) limit = 50;

    let filter = { isDeleted: false };

    // status = all | active | inactive
    if (status === "active") filter.isActive = true;
    if (status === "inactive") filter.isActive = false;

    if (search) {
      search = search.trim();
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { state: { $regex: search, $options: "i" } }
      ];
    }

    let skip = (page - 1) * limit;

    let [venues, total] = await Promise.all([
      Venue.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Venue.countDocuments(filter)
    ]);

    return res.status(200).send({
      status: true,
      message: "venues",
      data: venues,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

/** ✅ GET SINGLE VENUE */
const getVenueById = async function (req, res) {
  try {
    let venueId = req.params.venueId || req.params.id;
    if (!venueId) return res.status(400).send({ status: false, message: "venueId is required" });

    let venue = await Venue.findOne({ _id: venueId, isDeleted: false });
    if (!venue) return res.status(404).send({ status: false, message: "venue not found" });

    return res.status(200).send({ status: true, message: "venue", data: venue });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

/** ✅ UPDATE VENUE */
const updateVenue = async function (req, res) {
  try {
    let venueId = req.params.venueId || req.params.id;
    let data = req.body;

    if (!venueId) return res.status(400).send({ status: false, message: "venueId is required" });
    if (!data) return res.status(400).send({ status: false, message: "please enter fields to update" });

    // if name coming, validate
    if (data.name && data.name.trim().length < 2)
      return res.status(400).send({ status: false, message: "please enter valid venue name" });

    if (data.ownerEmail && !data.ownerEmail.includes("@"))
      return res.status(400).send({ status: false, message: "please enter valid owner email" });

    if (data.capacity && Number(data.capacity) < 0)
      return res.status(400).send({ status: false, message: "capacity should be >= 0" });

    if (data.pricePerHour && Number(data.pricePerHour) < 0)
      return res.status(400).send({ status: false, message: "pricePerHour should be >= 0" });

    if (data.name) data.name = data.name.trim();
    if (data.ownerEmail) data.ownerEmail = data.ownerEmail.toLowerCase();

    let venue = await Venue.findOneAndUpdate(
      { _id: venueId, isDeleted: false },
      { $set: data },
      { new: true }
    );

    if (!venue) return res.status(404).send({ status: false, message: "venue not found" });

    return res.status(200).send({ status: true, message: "venue updated", data: venue });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

/** ✅ ACTIVATE / SUSPEND VENUE */
const toggleVenue = async function (req, res) {
  try {
    let venueId = req.params.venueId || req.params.id;
    let data = req.body;

    if (!venueId) return res.status(400).send({ status: false, message: "venueId is required" });
    if (!data) return res.status(400).send({ status: false, message: "please enter fields..." });

    let { isActive } = data;
    if (typeof isActive !== "boolean")
      return res.status(400).send({ status: false, message: "isActive must be boolean" });

    let venue = await Venue.findOneAndUpdate(
      { _id: venueId, isDeleted: false },
      { $set: { isActive } },
      { new: true }
    );

    if (!venue) return res.status(404).send({ status: false, message: "venue not found" });

    return res.status(200).send({
      status: true,
      message: isActive ? "venue activated" : "venue suspended",
      data: venue
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

/** ✅ DELETE VENUE (soft delete) */
const deleteVenue = async function (req, res) {
  try {
    let venueId = req.params.venueId || req.params.id;
    if (!venueId) return res.status(400).send({ status: false, message: "venueId is required" });

    let venue = await Venue.findOneAndUpdate(
      { _id: venueId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!venue) return res.status(404).send({ status: false, message: "venue not found" });

    return res.status(200).send({ status: true, message: "venue deleted" });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

/** ✅ VENUE STATS (for dashboard cards) */
const getVenueStats = async function (req, res) {
  try {
    let totalVenues = await Venue.countDocuments({ isDeleted: false });
    let activeVenues = await Venue.countDocuments({ isDeleted: false, isActive: true });
    let inactiveVenues = totalVenues - activeVenues;

    return res.status(200).send({
      status: true,
      message: "venue stats",
      data: { totalVenues, activeVenues, inactiveVenues }
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = {
  createVenue,
  getVenues,
  getVenueById,
  updateVenue,
  toggleVenue,
  deleteVenue,
  getVenueStats
};

