import express from "express";

import cityRouter from "./routes/city.routes.js";
import profileRouter from "./routes/profile.routes.js";
import userRouter from "./routes/user.routes.js";
import { errorHandler } from "./middleware/error-handler.middleware.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import apiRouter from "./routes/index.routes.js";

const app = express();

app.use(express.json());

// API routes
app.use("/api/v1", apiRouter);
app.use("/api/v1/cities", cityRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/profiles", profileRouter);

// Handle unmatched routes
app.use(notFoundHandler);

// Handle application errors
app.use(errorHandler);

export default app;
