import express from "express";
import { KpiController } from "../controllers/kpiController.js";

const router = express.Router();

router.get("/", KpiController.getKpiData)



export default router