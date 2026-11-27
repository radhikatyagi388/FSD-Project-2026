import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import User from "../models/User.js";

const uploadRoot = path.resolve("uploads");

const getStudent = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== "student") {
    const error = new Error("Only student accounts can upload these files.");
    error.statusCode = 403;
    throw error;
  }

  return user;
};

const removePreviousFile = async (fileUrl) => {
  if (!fileUrl || !fileUrl.startsWith("/uploads/")) return;

  const relativePath = fileUrl.replace(/^\/uploads\//, "");
  const resolvedPath = path.resolve(uploadRoot, relativePath);

  if (!resolvedPath.startsWith(`${uploadRoot}${path.sep}`)) return;

  try {
    await fs.unlink(resolvedPath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Could not remove previous upload:", error.message);
    }
  }
};

const detectFileType = (buffer) => {
  if (
    buffer.length >= 5 &&
    buffer.subarray(0, 5).toString("ascii") === "%PDF-"
  ) {
    return "pdf";
  }

  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "jpg";
  }

  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    )
  ) {
    return "png";
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }

  return null;
};

const saveUpload = async (file, folder, extension) => {
  const directory = path.join(uploadRoot, folder);
  await fs.mkdir(directory, { recursive: true });

  const filename = `${crypto.randomUUID()}.${extension}`;
  await fs.writeFile(path.join(directory, filename), file.buffer, {
    flag: "wx",
  });

  return `/uploads/${folder}/${filename}`;
};

export const uploadResumeFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a PDF resume.",
      });
    }

    if (detectFileType(req.file.buffer) !== "pdf") {
      return res.status(400).json({
        success: false,
        message: "The uploaded file is not a valid PDF.",
      });
    }

    const user = await getStudent(req.user.id);
    const fileUrl = await saveUpload(req.file, "resumes", "pdf");

    const previousUrl = user.studentProfile.resumeUrl;
    user.studentProfile.resumeUrl = fileUrl;
    await user.save();

    await removePreviousFile(previousUrl);

    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully.",
      resumeUrl: fileUrl,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a profile photo.",
      });
    }

    const extension = detectFileType(req.file.buffer);
    if (!["jpg", "png", "webp"].includes(extension)) {
      return res.status(400).json({
        success: false,
        message: "The uploaded file is not a valid JPEG, PNG or WebP image.",
      });
    }

    const user = await getStudent(req.user.id);
    const fileUrl = await saveUpload(req.file, "avatars", extension);

    const previousUrl = user.studentProfile.profilePhotoUrl;
    user.studentProfile.profilePhotoUrl = fileUrl;
    await user.save();

    await removePreviousFile(previousUrl);

    return res.status(200).json({
      success: true,
      message: "Profile photo uploaded successfully.",
      profilePhotoUrl: fileUrl,
    });
  } catch (error) {
    next(error);
  }
};
