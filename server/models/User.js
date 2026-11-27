import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["student", "officer", "recruiter", "admin"],
      default: "student",
    },

    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      default: null,
    },

    studentProfile: {
      phone: { type: String, trim: true, default: "" },
      location: { type: String, trim: true, default: "" },
      headline: { type: String, trim: true, default: "" },
      bio: { type: String, trim: true, default: "" },

      academic: {
        college: { type: String, trim: true, default: "" },
        degree: { type: String, trim: true, default: "" },
        branch: { type: String, trim: true, default: "" },
        graduationYear: { type: Number, default: null },
        currentSemester: { type: Number, default: null },
        cgpa: { type: Number, min: 0, max: 10, default: null },
        activeBacklogs: { type: Number, min: 0, default: 0 },
      },

      skills: { type: [String], default: [] },

      projects: [{
        title: { type: String, trim: true },
        description: { type: String, trim: true },
        technologies: [String],
        githubUrl: { type: String, trim: true },
        liveUrl: { type: String, trim: true },
      }],

      experience: [{
        company: { type: String, trim: true },
        role: { type: String, trim: true },
        description: { type: String, trim: true },
        startDate: Date,
        endDate: Date,
      }],

      certifications: [{
        name: { type: String, trim: true },
        issuer: { type: String, trim: true },
        issueDate: Date,
        credentialUrl: { type: String, trim: true },
      }],

      resumeUrl: { type: String, trim: true, default: "" },
      profilePhotoUrl: { type: String, trim: true, default: "" },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
