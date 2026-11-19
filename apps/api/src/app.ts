import express from "express";

import authRouter from "./routes/auth.routes.js";
import blueprintRouter from "./routes/blueprint.routes.js";
import budgetRouter from "./routes/budget.routes.js";
import cityRouter from "./routes/city.routes.js";
import expenseCategoryRouter from "./routes/expense-category.routes.js";
import profileRouter from "./routes/profile.routes.js";
import userRouter from "./routes/user.routes.js";
import { corsMiddleware } from "./middleware/cors.middleware.js";
import { errorHandler } from "./middleware/error-handler.middleware.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import apiRouter from "./routes/index.routes.js";

const app = express();

app.use(corsMiddleware);
app.use(express.json());

// API routes
app.use("/api/v1", apiRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/cities", cityRouter);
app.use("/api/v1/expense-categories", expenseCategoryRouter);
app.use("/api/v1/blueprints", budgetRouter);
app.use("/api/v1/blueprints", blueprintRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/profiles", profileRouter);

// Handle unmatched routes
app.use(notFoundHandler);

// Handle application errors
app.use(errorHandler);

export default app;
