import express from "express";

import { errorHandler } from "./middleware/error-handler.middleware.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import apiRouter from "./routes/index.routes.js";

const app = express();

app.use(express.json());

// API routes
app.use("/api/v1", apiRouter);


// Handle unmatched routes
app.use(notFoundHandler);

// Handle application errors
app.use(errorHandler);

export default app;