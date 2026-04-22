import express from "express";
import {
  getTasks,
  createTask,
  deleteTask,
  updateTask,
} from "../controllers/task.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Get all tasks of logged-in user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get("/", authMiddleware, getTasks);

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Build backend API
 *               description:
 *                 type: string
 *                 example: Implement authentication and task CRUD system
 *     responses:
 *       201:
 *         description: Task created successfully
 */
router.post("/", authMiddleware, createTask);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 64f1a2b3c4d5e6f7890abc12
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated Task Title
 *               description:
 *                 type: string
 *                 example: Updated task description
 *     responses:
 *       200:
 *         description: Task updated successfully
 */
router.put("/:id", authMiddleware, updateTask);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
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
 *         description: Task deleted successfully
 */
router.delete("/:id", authMiddleware, deleteTask);

export default router;
