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
 *     summary: Get user tasks
 */
router.get("/", authMiddleware, getTasks);

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create task
 */
router.post("/", authMiddleware, createTask);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   put:
 *     summary: Update task
 */
router.put("/:id", authMiddleware, updateTask);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: Delete task
 */
router.delete("/:id", authMiddleware, deleteTask);

export default router;
