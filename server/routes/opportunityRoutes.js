import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  getOpportunities,
  getMyOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
} from "../controllers/opportunityController.js";

const router = express.Router();

router.use(protect);

router.get("/", getOpportunities);
router.get("/manage/mine", authorize("officer", "recruiter", "admin"), getMyOpportunities);
router.post("/", authorize("officer", "recruiter", "admin"), createOpportunity);
router.get("/:id", getOpportunityById);
router.patch("/:id", authorize("officer", "recruiter", "admin"), updateOpportunity);
router.delete("/:id", authorize("officer", "recruiter", "admin"), deleteOpportunity);

export default router;
