import { Response } from "express";
import Task from "../models/task.model.js";
import redisClient from "../config/redis.js";

const CACHE_TTL = 60;

const taskCacheKey = (userId: string) => `tasks:${userId}`;

// ================= GET (with Redis cache + pagination) =================
export const getTasks = async (req: any, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);

    const useCache = page === 1 && limit === 20;
    const cacheKey = taskCacheKey(req.user.userId);

    if (useCache) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.json({ ...JSON.parse(cached), fromCache: true });
      }
    }

    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      Task.find({ userId: req.user.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Task.countDocuments({ userId: req.user.userId }),
    ]);

    const payload = {
      tasks,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      fromCache: false,
    };

    if (useCache) {
      await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(payload));
    }

    res.json(payload);
  } catch (err) {
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
      title: title.trim(),
      description: description?.trim(),
      userId: req.user.userId,
    });

    await redisClient.del(taskCacheKey(req.user.userId));

    res.status(201).json(task);
  } catch {
    res.status(500).json({ message: "Create failed" });
  }
};

// ================= UPDATE =================
export const updateTask = async (req: any, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    task.title = req.body.title?.trim() ?? task.title;
    task.description = req.body.description?.trim() ?? task.description;
    task.completed = req.body.completed ?? task.completed;

    await task.save();

    await redisClient.del(taskCacheKey(req.user.userId));

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

    if (task.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await task.deleteOne();

    await redisClient.del(taskCacheKey(req.user.userId));

    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
};
