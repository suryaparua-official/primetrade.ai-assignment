import express from "express";
import {
  getTasks,
  createTask,
  deleteTask,
} from "../controllers/task.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getTasks);
router.post("/", authMiddleware, createTask);
router.delete("/:id", authMiddleware, deleteTask);

export default router;
