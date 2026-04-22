import { Request, Response } from "express";
import Task from "../models/task.model.js";

// ================= GET =================
export const getTasks = async (req: any, res: Response) => {
  try {
    const tasks = await Task.find({ userId: req.user.userId });
    res.json(tasks);
  } catch {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

// ================= CREATE =================
export const createTask = async (req: any, res: Response) => {
  try {
    const { title, description } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Title required" });
    }

    const task = await Task.create({
      title,
      description,
      userId: req.user.userId,
    });

    res.status(201).json(task);
  } catch {
    res.status(500).json({ message: "Create failed" });
  }
};

// ================= UPDATE (🔥 NEW) =================
export const updateTask = async (req: any, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 🔐 ownership check
    if (task.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    task.title = req.body.title ?? task.title;
    task.description = req.body.description ?? task.description;
    task.completed = req.body.completed ?? task.completed;

    await task.save();

    res.json(task);
  } catch {
    res.status(500).json({ message: "Update failed" });
  }
};

// ================= DELETE =================
export const deleteTask = async (req: any, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 🔐 ownership check
    if (task.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await task.deleteOne();

    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
};
