import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary";

// Storage setup: folder path includes doctor ID
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const doctorId = req.body.doctorId; // Doctor ID sent in request body or query
    if (!doctorId) throw new Error("doctorId is required");

    return {
      folder: `doctor_docs/${doctorId}`, // Store docs under doctor-specific folder
      format: file.mimetype.split("/")[1], // jpg, png, pdf, etc.
      public_id: `${Date.now()}_${file.originalname}`, // optional unique name
    };
  },
});

const parser = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

export default parser;
