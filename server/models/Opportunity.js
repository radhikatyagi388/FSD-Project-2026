import mongoose from "mongoose";

const opportunitySchema = new mongoose.Schema(
  {
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },

    jobType: {
      type: String,
      enum: ["Internship", "Full-time", "Part-time", "Contract"],
      required: true,
    },

    workMode: {
      type: String,
      enum: ["On-site", "Remote", "Hybrid"],
      default: "On-site",
    },

    salary: { type: String, default: "Not disclosed", trim: true },
    applicationDeadline: { type: Date, required: true },

    eligibility: {
      minimumCgpa: { type: Number, min: 0, max: 10, default: 0 },
      eligibleBranches: { type: [String], default: [] },
      graduationYears: { type: [Number], default: [] },
      maximumBacklogs: { type: Number, min: 0, default: 0 },
    },

    requiredSkills: { type: [String], default: [] },

    status: {
      type: String,
      enum: ["Draft", "Active", "Closed"],
      default: "Active",
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      default: null,
    },
  },
  { timestamps: true }
);

opportunitySchema.index({ status: 1, applicationDeadline: 1 });
opportunitySchema.index({ company: 1, role: 1 });

const Opportunity = mongoose.model("Opportunity", opportunitySchema);
export default Opportunity;
