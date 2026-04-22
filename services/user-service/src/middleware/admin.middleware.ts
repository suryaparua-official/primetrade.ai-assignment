import { Response, NextFunction } from "express";

export const adminOnly = (req: any, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }

  next();
};
