import User from "../models/User.js";

const cleanString = (value) =>
  typeof value === "string" ? value.trim() : "";

const cleanStringArray = (value) =>
  Array.isArray(value)
    ? [...new Set(value.filter((item) => typeof item === "string").map((item) => item.trim()).filter(Boolean))]
    : [];

const getStudent = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== "student") {
    const error = new Error("Only student accounts can access this profile");
    error.statusCode = 403;
    throw error;
  }

  return user;
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await getStudent(req.user.id);

    return res.status(200).json({
      success: true,
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        ...user.studentProfile.toObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await getStudent(req.user.id);
    const data = req.body?.profile ?? req.body;

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid profile data",
      });
    }

    const simpleFields = ["phone", "location", "headline", "bio", "resumeUrl"];

    for (const field of simpleFields) {
      if (Object.hasOwn(data, field)) {
        if (typeof data[field] !== "string") {
          return res.status(400).json({
            success: false,
            message: `${field} must be a string`,
          });
        }
        user.studentProfile[field] = cleanString(data[field]);
      }
    }

    if (Object.hasOwn(data, "academic")) {
      if (!data.academic || typeof data.academic !== "object" || Array.isArray(data.academic)) {
        return res.status(400).json({
          success: false,
          message: "Academic details must be an object",
        });
      }

      const academicFields = [
        "college", "degree", "branch",
        "graduationYear", "currentSemester", "cgpa", "activeBacklogs",
      ];

      for (const field of academicFields) {
        if (!Object.hasOwn(data.academic, field)) continue;

        if (["college", "degree", "branch"].includes(field)) {
          user.studentProfile.academic[field] = cleanString(data.academic[field]);
        } else {
          const value = data.academic[field];

          if (value === null || value === "") {
            user.studentProfile.academic[field] = null;
          } else if (Number.isFinite(Number(value))) {
            user.studentProfile.academic[field] = Number(value);
          } else {
            return res.status(400).json({
              success: false,
              message: `${field} must be a valid number`,
            });
          }
        }
      }
    }

    if (Object.hasOwn(data, "skills")) {
      if (!Array.isArray(data.skills)) {
        return res.status(400).json({
          success: false,
          message: "Skills must be an array",
        });
      }
      user.studentProfile.skills = cleanStringArray(data.skills);
    }

    const arrayFields = ["projects", "experience", "certifications"];

    for (const field of arrayFields) {
      if (!Object.hasOwn(data, field)) continue;

      if (!Array.isArray(data[field])) {
        return res.status(400).json({
          success: false,
          message: `${field} must be an array`,
        });
      }

      user.studentProfile[field] = data[field];
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Student profile updated successfully",
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        ...user.studentProfile.toObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};
