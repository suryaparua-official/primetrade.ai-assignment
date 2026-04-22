import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { timestamps: true },
);

export default mongoose.model("Task", taskSchema);
