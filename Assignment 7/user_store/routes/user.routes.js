import express from "express";
import {
    registerUser,
    loginUser,
    changePassword,
    forgotPassword,
    resetPassword
} from "../controllers/auth.controller.js";
console.log(registerUser);
import { authenticate } from "../middlewares/middleware.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/change-password", authenticate, changePassword);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;