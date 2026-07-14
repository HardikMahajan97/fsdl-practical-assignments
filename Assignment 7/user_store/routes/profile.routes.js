import express from "express";
import {
  updateProfile,
  getMyProfile,
  getProfileByEmail,
  getProfilesByEmails,
} from "../controllers/profile.controller.js";
import { authenticate, authorize } from "../middlewares/middleware.js";

const router = express.Router();

// Student routes
router.put("/update", authenticate, authorize("student"), updateProfile);
router.get("/me", authenticate, authorize("student"), getMyProfile);

// Admin routes
router.get("/student/:email", authenticate, authorize("admin"), getProfileByEmail);
router.post("/students/bulk", authenticate, authorize("admin"), getProfilesByEmails);

export default router;
