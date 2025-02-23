import multer from "multer";

const storage = multer.memoryStorage();

export const multipleUpload = multer({ storage }).fields([
  { name: "profilePhoto", maxCount: 1 }, // Handles a single profile photo upload
  { name: "resume", maxCount: 1 }, // Handles a single resume upload
]);