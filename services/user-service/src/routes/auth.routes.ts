import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";
import User from "../models/user.model.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Surya Parua
 *               email:
 *                 type: string
 *                 example: surya.parua.dev@gmail.com
 *               password:
 *                 type: string
 *                 example: secure123
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post("/register", register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: surya.parua.dev@gmail.com
 *               password:
 *                 type: string
 *                 example: secure123
 *     responses:
 *       200:
 *         description: Login successful (returns JWT token)
 */
router.post("/login", login);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current logged-in user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched
 */
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

/**
 * @swagger
 * /api/v1/auth/admin:
 *   get:
 *     summary: Admin access test
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin access granted
 *       403:
 *         description: Forbidden
 */
router.get("/admin", authMiddleware, adminOnly, (req: any, res) => {
  res.json({
    message: "Admin access granted",
    user: req.user,
  });
});

/**
 * @swagger
 * /api/v1/auth/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get("/users", authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/**
 * @swagger
 * /api/v1/auth/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 64f1a2b3c4d5e6f7890abc12
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete("/users/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
