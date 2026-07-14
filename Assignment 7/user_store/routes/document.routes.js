import express from "express";
import {
  uploadDocument,
  getMyDocuments,
  deleteDocument,
  getDocumentsByEmail,
} from "../controllers/document.controller.js";
import { authenticate, authorize } from "../middlewares/middleware.js";
import { upload } from "../utils/cloudinary.js";

const router = express.Router();

// Student routes
router.post("/upload", authenticate, authorize("student"), upload.single("file"), uploadDocument);
router.get("/mine", authenticate, authorize("student"), getMyDocuments);
router.delete("/:id", authenticate, authorize("student"), deleteDocument);

// Admin routes
router.get("/student/:email", authenticate, authorize("admin"), getDocumentsByEmail);

export default router;
