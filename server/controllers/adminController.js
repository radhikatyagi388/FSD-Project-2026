import mongoose from "mongoose";
import User from "../models/User.js";
import Opportunity from "../models/Opportunity.js";
import Application from "../models/Application.js";

// GET /api/admin/stats
export const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalRecruiters,
      totalOfficers,
      totalAdmins,
      activeUsers,
      inactiveUsers,
      totalDrives,
      activeDrives,
      closedDrives,
      totalApplications,
      applicationStats,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "recruiter" }),
      User.countDocuments({ role: "officer" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      Opportunity.countDocuments(),
      Opportunity.countDocuments({ status: "Active" }),
      Opportunity.countDocuments({ status: "Closed" }),
      Application.countDocuments(),
      Application.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const applicationsByStatus = {
      Applied: 0,
      "Under Review": 0,
      Shortlisted: 0,
      Rejected: 0,
      Selected: 0,
    };

    applicationStats.forEach((item) => {
      applicationsByStatus[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          students: totalStudents,
          recruiters: totalRecruiters,
          officers: totalOfficers,
          admins: totalAdmins,
          active: activeUsers,
          inactive: inactiveUsers,
        },
        opportunities: {
          total: totalDrives,
          active: activeDrives,
          closed: closedDrives,
        },
        applications: {
          total: totalApplications,
          byStatus: applicationsByStatus,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch admin statistics.",
      error: error.message,
    });
  }
};

// GET /api/admin/users
export const getAdminUsers = async (req, res) => {
  try {
    const {
      search = "",
      role = "",
      status = "",
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Math.max(1, Number.parseInt(page, 10) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number.parseInt(limit, 10) || 10)
    );

    const filter = {};

    if (role) {
      if (!["student", "officer", "recruiter", "admin"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role filter.",
        });
      }
      filter.role = role;
    }

    if (status === "active") filter.isActive = true;
    if (status === "inactive") filter.isActive = false;

    if (status && !["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status filter.",
      });
    }

    const searchText = search.trim();

    if (searchText) {
      const escapedSearch = searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { email: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select("name email role isActive isVerified institutionId createdAt")
        .populate("institutionId", "name")
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        total: totalUsers,
        page: currentPage,
        limit: pageSize,
        totalPages: Math.ceil(totalUsers / pageSize),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch users.",
      error: error.message,
    });
  }
};

// PATCH /api/admin/users/:id/status
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false.",
      });
    }

    if (id === String(req.user.id) && !isActive) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own admin account.",
      });
    }

    const targetUser = await User.findById(id).select("name email role isActive");

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (targetUser.role === "admin" && targetUser.isActive && !isActive) {
      const activeAdminCount = await User.countDocuments({
        role: "admin",
        isActive: true,
      });

      if (activeAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "The last active admin account cannot be deactivated.",
        });
      }
    }

    targetUser.isActive = isActive;
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully.`,
      user: {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        isActive: targetUser.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update user status.",
      error: error.message,
    });
  }
};

// GET /api/admin/opportunities
// Admin: view every placement drive with its application count.
export const getAdminOpportunities = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Math.max(1, Number.parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 10));

    const filter = {};

    if (status) {
      if (!["Draft", "Active", "Closed"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid opportunity status.",
        });
      }
      filter.status = status;
    }

    const searchText = search.trim();

    if (searchText) {
      const safeSearch = searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { company: { $regex: safeSearch, $options: "i" } },
        { role: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const [opportunities, total] = await Promise.all([
      Opportunity.find(filter)
        .populate("postedBy", "name email")
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      Opportunity.countDocuments(filter),
    ]);

    const opportunityIds = opportunities.map((item) => item._id);

    const applicationCounts = opportunityIds.length
      ? await Application.aggregate([
          { $match: { opportunity: { $in: opportunityIds } } },
          {
            $group: {
              _id: "$opportunity",
              count: { $sum: 1 },
            },
          },
        ])
      : [];

    const countMap = new Map(
      applicationCounts.map((item) => [String(item._id), item.count])
    );

    const results = opportunities.map((item) => ({
      ...item,
      applicationCount: countMap.get(String(item._id)) || 0,
    }));

    res.status(200).json({
      success: true,
      opportunities: results,
      pagination: {
        total,
        page: currentPage,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch placement drives.",
      error: error.message,
    });
  }
};

// GET /api/admin/applications
// Admin: view every application across the platform.
export const getAdminApplications = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Math.max(1, Number.parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 10));

    const validStatuses = [
      "Applied",
      "Under Review",
      "Shortlisted",
      "Rejected",
      "Selected",
    ];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status.",
      });
    }

    const filter = {};

    if (status) filter.status = status;

    const searchText = search.trim();

    if (searchText) {
      const safeSearch = searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const matchingOpportunities = await Opportunity.find({
        $or: [
          { company: { $regex: safeSearch, $options: "i" } },
          { role: { $regex: safeSearch, $options: "i" } },
        ],
      }).select("_id");

      const opportunityIds = matchingOpportunities.map((item) => item._id);

      filter.$or = [
        { "studentSnapshot.name": { $regex: safeSearch, $options: "i" } },
        { "studentSnapshot.email": { $regex: safeSearch, $options: "i" } },
        { opportunity: { $in: opportunityIds } },
      ];
    }

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate("student", "name email")
        .populate("opportunity", "company role location jobType status")
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      Application.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      applications,
      pagination: {
        total,
        page: currentPage,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch applications.",
      error: error.message,
    });
  }
};
