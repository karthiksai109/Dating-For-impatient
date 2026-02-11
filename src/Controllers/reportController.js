const Report = require("../Models/reportModel");
const User = require("../Models/userRegisterModel");

// USER: Report another user
const createReport = async function (req, res) {
  try {
    let userId = req.user.userId;
    let { reportedUserId, reason, details } = req.body;

    if (!reportedUserId) return res.status(400).send({ status: false, message: "reportedUserId required" });
    if (!reason) return res.status(400).send({ status: false, message: "reason required" });

    let target = await User.findById(reportedUserId);
    if (!target) return res.status(404).send({ status: false, message: "reported user not found" });

    let report = await Report.create({
      reporterUserId: userId,
      reportedUserId,
      reason: reason.trim(),
      details: details || ""
    });

    return res.status(201).send({ status: true, message: "report submitted", data: report });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// ADMIN: Get all reports
const getAllReports = async function (req, res) {
  try {
    let { status } = req.query;
    let filter = {};
    if (status) filter.status = status;

    let reports = await Report.find(filter)
      .populate("reporterUserId", "name email")
      .populate("reportedUserId", "name email status")
      .sort({ createdAt: -1 });

    return res.status(200).send({ status: true, message: "reports", data: reports });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// ADMIN: Update report status
const updateReport = async function (req, res) {
  try {
    let { reportId } = req.params;
    let { status, adminNotes } = req.body;

    let updates = {};
    if (status) updates.status = status;
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;

    let report = await Report.findByIdAndUpdate(reportId, updates, { new: true })
      .populate("reporterUserId", "name email")
      .populate("reportedUserId", "name email status");

    if (!report) return res.status(404).send({ status: false, message: "report not found" });

    return res.status(200).send({ status: true, message: "report updated", data: report });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { createReport, getAllReports, updateReport };
