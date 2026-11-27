import mongoose from "mongoose";
import Opportunity from "../models/Opportunity.js";

const staffRoles = ["officer", "recruiter", "admin"];

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

const validateOpportunity = (data) => {
  const required = [
    "company",
    "role",
    "description",
    "location",
    "jobType",
    "applicationDeadline",
  ];

  for (const field of required) {
    if (data[field] === undefined || data[field] === "") {
      return `${field} is required`;
    }
  }

  if (!["Internship", "Full-time", "Part-time", "Contract"].includes(data.jobType)) {
    return "Invalid job type";
  }

  if (data.applicationDeadline && Number.isNaN(Date.parse(data.applicationDeadline))) {
    return "Invalid application deadline";
  }

  if (
    data.eligibility?.minimumCgpa !== undefined &&
    (Number(data.eligibility.minimumCgpa) < 0 ||
      Number(data.eligibility.minimumCgpa) > 10)
  ) {
    return "Minimum CGPA must be between 0 and 10";
  }

  return null;
};

const normalizeOpportunity = (data) => ({
  company: String(data.company).trim(),
  role: String(data.role).trim(),
  description: String(data.description).trim(),
  location: String(data.location).trim(),
  jobType: data.jobType,
  workMode: data.workMode || "On-site",
  salary: data.salary || "Not disclosed",
  applicationDeadline: new Date(data.applicationDeadline),
  eligibility: {
    minimumCgpa: Number(data.eligibility?.minimumCgpa || 0),
    eligibleBranches: Array.isArray(data.eligibility?.eligibleBranches)
      ? data.eligibility.eligibleBranches
      : [],
    graduationYears: Array.isArray(data.eligibility?.graduationYears)
      ? data.eligibility.graduationYears.map(Number)
      : [],
    maximumBacklogs: Number(data.eligibility?.maximumBacklogs || 0),
  },
  requiredSkills: Array.isArray(data.requiredSkills)
    ? [...new Set(data.requiredSkills.filter((x) => typeof x === "string").map((x) => x.trim()).filter(Boolean))]
    : [],
});

export const getOpportunities = async (req, res, next) => {
  try {
    const {
      search = "",
      jobType,
      location,
      workMode,
      page = 1,
      limit = 12,
    } = req.query;

    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(limit) || 12));

    const filter = { status: "Active", applicationDeadline: { $gte: new Date() } };

    if (search.trim()) {
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { company: { $regex: safeSearch, $options: "i" } },
        { role: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
        { requiredSkills: { $regex: safeSearch, $options: "i" } },
      ];
    }

    if (jobType) filter.jobType = jobType;
    if (location) filter.location = { $regex: location, $options: "i" };
    if (workMode) filter.workMode = workMode;

    const [opportunities, total] = await Promise.all([
      Opportunity.find(filter)
        .populate("postedBy", "name")
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize),
      Opportunity.countDocuments(filter),
    ]);

    res.json({
      success: true,
      opportunities,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getOpportunityById = async (req, res, next) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid opportunity ID." });
    }

    const opportunity = await Opportunity.findOne({
      _id: req.params.id,
      status: "Active",
      applicationDeadline: { $gte: new Date() },
    }).populate("postedBy", "name");

    if (!opportunity) {
      return res.status(404).json({ success: false, message: "Opportunity not found or closed." });
    }

    res.json({ success: true, opportunity });
  } catch (error) {
    next(error);
  }
};

export const createOpportunity = async (req, res, next) => {
  try {
    const validationError = validateOpportunity(req.body);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const opportunity = await Opportunity.create({
      ...normalizeOpportunity(req.body),
      status: req.body.status === "Draft" ? "Draft" : "Active",
      postedBy: req.user.id,
      institutionId: req.user.institutionId || null,
    });

    res.status(201).json({
      success: true,
      message: "Opportunity created successfully.",
      opportunity,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOpportunity = async (req, res, next) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid opportunity ID." });
    }

    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: "Opportunity not found." });
    }

    const isOwner = String(opportunity.postedBy) === String(req.user.id);
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You cannot edit this opportunity." });
    }

    const allowed = [
      "company", "role", "description", "location", "jobType",
      "workMode", "salary", "applicationDeadline", "eligibility",
      "requiredSkills", "status",
    ];

    const merged = { ...opportunity.toObject(), ...req.body };
    const validationError = validateOpportunity(merged);
    if (validationError && req.body.status !== "Closed") {
      return res.status(400).json({ success: false, message: validationError });
    }

    const updates = normalizeOpportunity(merged);
    for (const field of allowed) {
      if (Object.hasOwn(req.body, field)) {
        opportunity[field] = updates[field] ?? req.body[field];
      }
    }

    if (req.body.status && ["Draft", "Active", "Closed"].includes(req.body.status)) {
      opportunity.status = req.body.status;
    }

    await opportunity.save();

    res.json({
      success: true,
      message: "Opportunity updated successfully.",
      opportunity,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteOpportunity = async (req, res, next) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid opportunity ID." });
    }

    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: "Opportunity not found." });
    }

    const isOwner = String(opportunity.postedBy) === String(req.user.id);
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You cannot close this opportunity." });
    }

    opportunity.status = "Closed";
    await opportunity.save();

    res.json({ success: true, message: "Opportunity closed successfully." });
  } catch (error) {
    next(error);
  }
};

// Recruiter/staff: view all drives created by the logged-in user.
export const getMyOpportunities = async (req, res, next) => {
  try {
    const opportunities = await Opportunity.find({
      postedBy: req.user.id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      opportunities,
    });
  } catch (error) {
    next(error);
  }
};
