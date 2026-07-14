import express from "express";

const app = express();

// Middleware
app.use(express.json());

// Health Route
app.get("/api/v1", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "LVN Atlas API is running",
    version: "0.1.0",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

export default app;