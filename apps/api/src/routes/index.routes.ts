import { Router } from "express";
import { getApiHealth } from "../controllers/health.controller.js";

const router = Router();

router.get("/", getApiHealth);

export default router;
