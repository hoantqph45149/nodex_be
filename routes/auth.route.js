import express from "express";
import {
  forgotPassword,
  getMe,
  login,
  logout,
  resetPassword,
  signup,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/protectRoute.js";
import { forgotPasswordLimiter } from "../lib/utils/forgotPasswordLimiter.js";

const router = express.Router();

router.get("/me", protectRoute, getMe);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
