import express from "express";


// import { AppError } from "./utils/app-error.js";
import { errorHandler } from "./middleware/error-handler.middleware.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import apiRouter from "./routes/index.routes.js";

const app = express();

app.use(express.json());

// API routes
app.use("/api/v1", apiRouter);

// TESTING
// app.get("/api/v1/test-operational-error", () => {
//   throw new AppError(
//     400,
//     "TEST_OPERATIONAL_ERROR",
//     "This is a test operational error",
//   );
// });

// Handle unmatched routes
app.use(notFoundHandler);

// Handle application errors
app.use(errorHandler);

export default app;