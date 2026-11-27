import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  applyToOpportunity,
  getMyApplications,
  getApplications,
  updateApplicationStatus,
} from "../controllers/applicationController.js";

const router = express.Router();

router.use(protect);

router.post("/:opportunityId", authorize("student"), applyToOpportunity);
router.get("/my", authorize("student"), getMyApplications);
router.get("/", authorize("officer", "recruiter", "admin"), getApplications);
router.patch("/:id/status", authorize("officer", "recruiter", "admin"), updateApplicationStatus);

export default router;
