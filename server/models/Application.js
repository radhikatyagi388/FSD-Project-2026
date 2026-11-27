import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Opportunity",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Applied",
        "Under Review",
        "Shortlisted",
        "Rejected",
        "Selected",
      ],
      default: "Applied",
    },

    resumeUrl: { type: String, default: "" },

    studentSnapshot: {
      name: String,
      email: String,
      phone: String,
      college: String,
      degree: String,
      branch: String,
      cgpa: Number,
      graduationYear: Number,
      skills: [String],
    },

    statusHistory: [
      {
        status: {
          type: String,
          enum: [
            "Applied",
            "Under Review",
            "Shortlisted",
            "Rejected",
            "Selected",
          ],
        },
        changedAt: { type: Date, default: Date.now },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        note: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

// One student can apply only once to each opportunity.
applicationSchema.index(
  { student: 1, opportunity: 1 },
  { unique: true }
);

const Application = mongoose.model("Application", applicationSchema);
export default Application;
