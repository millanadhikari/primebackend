import express from "express";
import { TasksController } from "../controllers/tasksController.js";


const router = express.Router();
router.post('/', TasksController.createTask);
router.get('/', TasksController.getAllTasks);
router.get('/:id', TasksController.getTaskById); // Assuming getProjectById method exists in ProjectsController
router.put('/:id', TasksController.updateTask);
router.delete('/:id', TasksController.deleteTask); // Assuming deleteProject method exists in ProjectsController


export default router