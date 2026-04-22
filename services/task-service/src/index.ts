import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import taskRoutes from "./routes/task.routes.js";

import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

dotenv.config();

const app = express();

app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task Service API",
      version: "1.0.0",
      description: "Tasks CRUD API",
    },
    servers: [{ url: `http://localhost:${process.env.PORT}` }],
  },
  apis: ["./src/**/*.ts", "./dist/**/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1/tasks", taskRoutes);

// FIX 4: Health endpoint so Docker healthcheck works
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.get("/", (req, res) => {
  res.send("Task service running");
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(process.env.PORT, () => {
      console.log(`Task service running on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.error("Server failed to start", err);
    process.exit(1);
  }
};

startServer();
