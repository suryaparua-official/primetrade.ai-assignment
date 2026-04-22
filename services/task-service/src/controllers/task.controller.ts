import { Request, Response } from "express";
import Task from "../models/task.model.js";

export const getTasks = async (req: any, res: Response) => {
  const tasks = await Task.find({ userId: req.user.userId });
  res.json(tasks);
};

export const createTask = async (req: any, res: Response) => {
  const { title, description } = req.body;

  const task = await Task.create({
    title,
    description,
    userId: req.user.userId,
  });

  res.status(201).json(task);
};

export const deleteTask = async (req: any, res: Response) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};
