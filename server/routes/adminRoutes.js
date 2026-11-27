import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";

import {
  getAdminStats,
  getAdminUsers,
  updateUserStatus,
  getAdminOpportunities,
  getAdminApplications,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.get("/stats", getAdminStats);
router.get("/users", getAdminUsers);
router.get("/opportunities", getAdminOpportunities);
router.get("/applications", getAdminApplications);
router.patch("/users/:id/status", updateUserStatus);

export default router;
