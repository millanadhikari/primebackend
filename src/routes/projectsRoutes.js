import express from "express";
import { ProjectsController } from "../controllers/projectsController.js";


const router = express.Router();
router.post('/', ProjectsController.createProject);
router.get('/', ProjectsController.getAllProjects);
// router.get('/:id', ProjectsController.getProjectById); // Assuming getProjectById method exists in ProjectsController
router.put('/:id', ProjectsController.updateProject);
router.delete('/:id', ProjectsController.deleteProject); // Assuming deleteProject method exists in ProjectsController


export default router