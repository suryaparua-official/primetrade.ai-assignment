import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";

import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

dotenv.config();

const app = express();

// ================= MIDDLEWARE =================
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);

app.use(express.json());

// ================= ROUTES =================
app.use("/api/v1/auth", authRoutes);

// ================= SWAGGER SETUP =================
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

    // 🔐 JWT AUTH SUPPORT (VERY IMPORTANT)
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  // scan swagger comments
  apis: ["./src/routes/*.ts", "./dist/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
  }),
);

// ================= HEALTH =================
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// ================= ROOT =================
app.get("/", (req, res) => {
  res.send("User service running");
});

// ================= 404 =================
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ================= START SERVER =================
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 User service running on http://localhost:${PORT}`);
      console.log(`📘 Swagger docs → http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("❌ Server failed to start", error);
    process.exit(1);
  }
};

startServer();
