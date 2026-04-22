import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    completed: { type: Boolean, default: false }, // 🔥 ADD
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { timestamps: true },
);

export default mongoose.model("Task", taskSchema);
