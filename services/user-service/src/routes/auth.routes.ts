import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";
import User from "../models/user.model.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", authMiddleware, async (req: any, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "User profile fetched",
      user,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/admin", authMiddleware, adminOnly, (req: any, res) => {
  res.json({
    message: "Admin access granted",
    user: req.user,
  });
});

export default router;
