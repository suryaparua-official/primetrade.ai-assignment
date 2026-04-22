import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import taskRoutes from "./routes/task.routes.js";

import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/v1/tasks", taskRoutes);

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task Service API",
      version: "1.0.0",
      description: "API documentation for Task Service (Tasks CRUD)",
    },
    servers: [{ url: "http://localhost:5001" }],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(process.env.PORT, () => {
  console.log(`Task service running on ${process.env.PORT}`);
});
