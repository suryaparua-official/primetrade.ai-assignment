import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";

import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/v1/auth", authRoutes);

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User Service API",
      version: "1.0.0",
      description: "API documentation for User Service (Auth & Admin)",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}/api/v1`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.ts", "./dist/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true }),
);

// FIX 4: Health endpoint so Docker healthcheck works
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.get("/", (req, res) => {
  res.send("User service running");
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`User service running on http://localhost:${PORT}`);
      console.log(`Swagger docs → http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("Server failed to start", error);
    process.exit(1);
  }
};

startServer();
