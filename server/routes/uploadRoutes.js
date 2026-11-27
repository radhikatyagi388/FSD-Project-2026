import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  uploadResumeFile,
  uploadProfilePhoto,
} from "../controllers/uploadController.js";
import {
  uploadResume,
  uploadPhoto,
} from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/resume", protect, uploadResume.single("file"), uploadResumeFile);
router.post("/photo", protect, uploadPhoto.single("file"), uploadProfilePhoto);

export default router;
