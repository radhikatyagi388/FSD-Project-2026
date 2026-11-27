import multer from "multer";

const storage = multer.memoryStorage();

const createUploader = (allowedTypes, maxSize) =>
  multer({
    storage,
    limits: {
      fileSize: maxSize,
      files: 1,
    },
    fileFilter: (req, file, callback) => {
      if (!allowedTypes.includes(file.mimetype)) {
        return callback(new Error("Unsupported file type."));
      }
      callback(null, true);
    },
  });

export const uploadResume = createUploader(
  ["application/pdf"],
  5 * 1024 * 1024
);

export const uploadPhoto = createUploader(
  ["image/jpeg", "image/png", "image/webp"],
  2 * 1024 * 1024
);
