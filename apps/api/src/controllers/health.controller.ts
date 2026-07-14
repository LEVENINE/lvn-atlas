import { Request, Response } from "express";

export function getApiHealth(_req: Request, res: Response) {
  res.status(200).json({
    success: true,
    message: "LVN Atlas API is running",
    version: "0.1.0",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
}