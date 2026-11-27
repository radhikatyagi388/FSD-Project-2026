import mongoose from "mongoose";
import Application from "../models/Application.js";
import Opportunity from "../models/Opportunity.js";
import User from "../models/User.js";

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

export const applyToOpportunity = async (req, res, next) => {
  try {
    const { opportunityId } = req.params;

    if (!validId(opportunityId)) {
      return res.status(400).json({ success: false, message: "Invalid opportunity ID." });
    }

    if (req.user.role !== "student") {
      return res.status(403).json({ success: false, message: "Only students can apply." });
    }

    const opportunity = await Opportunity.findOne({
      _id: opportunityId,
      status: "Active",
      applicationDeadline: { $gte: new Date() },
    });

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "This opportunity is no longer accepting applications.",
      });
    }

    const student = await User.findById(req.user.id).select("-password");
    if (!student) {
      return res.status(404).json({ success: false, message: "Student account not found." });
    }

    const profile = student.studentProfile;
    const academic = profile.academic;

    if (!profile.resumeUrl) {
      return res.status(400).json({
        success: false,
        message: "Please upload your resume before applying.",
      });
    }

    if (
      academic.cgpa != null &&
      academic.cgpa < opportunity.eligibility.minimumCgpa
    ) {
      return res.status(400).json({
        success: false,
        message: `This opportunity requires a minimum CGPA of ${opportunity.eligibility.minimumCgpa}.`,
      });
    }

    if (
      opportunity.eligibility.eligibleBranches.length &&
      !opportunity.eligibility.eligibleBranches.some(
        (branch) => branch.toLowerCase() === (academic.branch || "").toLowerCase()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Your academic branch is not eligible for this opportunity.",
      });
    }

    if (
      opportunity.eligibility.graduationYears.length &&
      !opportunity.eligibility.graduationYears.includes(Number(academic.graduationYear))
    ) {
      return res.status(400).json({
        success: false,
        message: "Your graduation year is not eligible for this opportunity.",
      });
    }

    if (
      Number(academic.activeBacklogs || 0) >
      opportunity.eligibility.maximumBacklogs
    ) {
      return res.status(400).json({
        success: false,
        message: "Your active backlog count exceeds the eligibility limit.",
      });
    }

    const existing = await Application.findOne({
      student: student._id,
      opportunity: opportunity._id,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already applied to this opportunity.",
      });
    }

    const application = await Application.create({
      student: student._id,
      opportunity: opportunity._id,
      resumeUrl: profile.resumeUrl,
      studentSnapshot: {
        name: student.name,
        email: student.email,
        phone: profile.phone,
        college: academic.college,
        degree: academic.degree,
        branch: academic.branch,
        cgpa: academic.cgpa,
        graduationYear: academic.graduationYear,
        skills: profile.skills,
      },
      statusHistory: [{
        status: "Applied",
        changedBy: student._id,
        note: "Application submitted.",
      }],
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully.",
      application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already applied to this opportunity.",
      });
    }
    next(error);
  }
};

export const getMyApplications = async (req, res, next) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ success: false, message: "Student access only." });
    }

    const applications = await Application.find({ student: req.user.id })
      .populate("opportunity")
      .sort({ createdAt: -1 });

    res.json({ success: true, applications });
  } catch (error) {
    next(error);
  }
};

export const getApplications = async (req, res, next) => {
  try {
    if (!["officer", "recruiter", "admin"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Staff access only." });
    }

    const filter = {};

    if (req.user.role !== "admin") {
      const ownedOpportunities = await Opportunity.find({
        postedBy: req.user.id,
      }).select("_id");

      filter.opportunity = { $in: ownedOpportunities.map((item) => item._id) };
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const applications = await Application.find(filter)
      .populate("student", "name email")
      .populate("opportunity", "company role location jobType")
      .sort({ createdAt: -1 });

    res.json({ success: true, applications });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid application ID." });
    }

    const allowedStatuses = [
      "Applied",
      "Under Review",
      "Shortlisted",
      "Rejected",
      "Selected",
    ];

    const { status, note = "" } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid application status." });
    }

    const application = await Application.findById(req.params.id)
      .populate("opportunity");

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

    const isOwner =
      String(application.opportunity.postedBy) === String(req.user.id);

    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You cannot update this application's status.",
      });
    }

    application.status = status;
    application.statusHistory.push({
      status,
      changedBy: req.user.id,
      note: typeof note === "string" ? note.trim().slice(0, 500) : "",
    });

    await application.save();

    res.json({
      success: true,
      message: "Application status updated.",
      application,
    });
  } catch (error) {
    next(error);
  }
};
