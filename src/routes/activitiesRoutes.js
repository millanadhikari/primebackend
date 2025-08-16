import express from "express";
import { ActivitiesController } from "../controllers/activitiesController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();
console.log("✅ activitiesRoutes.js loaded");
router.get('/', authenticateToken, ActivitiesController.getAllActivities);

// router.get("/", (req, res) => {
//   console.log("🎯 /api/activities hit");
//   res.json([
//     { id: 1, name: "Morning Walk" },
//     { id: 2, name: "Physiotherapy" }
//   ]);
// });


export default router