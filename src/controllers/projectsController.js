import { ProjectsService } from "../services/projectsService.js";

export class ProjectsController {
    static async createProject(req, res) {
        try {
            const { name, description, assignedUsers } = req.body;
            if (!name || !description) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            // Logic to create a project in the database
            // Assuming you have a Project model
            const newProject = await ProjectsService.createProject({ name, description, assignedUsers });

            return res.status(201).json(newProject);
        } catch (error) {
            console.error('Error creating project:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async getAllProjects(req, res) {
        try {
            const projects = await ProjectsService.getAllProjects();
            return res.status(200).json(projects);
        } catch (error) {
            console.error('Error fetching projects:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async getProjectById(req, res) {
        try {
            const { id } = req.params;
            const project = await ProjectsService.getProjectById(id);

            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            return res.status(200).json(project);
        } catch (error) {
            console.error('Error fetching project:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async updateProject(req, res) {
        try {
            const { id } = req.params;
            const { name, description, assignedUserIds } = req.body;

            if (!name || !description) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            // Logic to update a project in the database
            const updatedProject = await ProjectsService.updateProject(id, { name, description, assignedUserIds });

            if (!updatedProject) {
                return res.status(404).json({ error: 'Project not found' });
            }

            return res.status(200).json(updatedProject);
        } catch (error) {
            console.error('Error updating project:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async deleteProject(req, res) {
        try {
            const { id } = req.params;

            const deletedProject = await ProjectsService.deleteProject(id);

            if (!deletedProject) {
                return res.status(404).json({ error: 'Project not found' });
            }

            return res.status(200).json({ message: 'Project deleted successfully', data: { id: deletedProject.id } });
        } catch (error) {
            console.error('Error deleting project:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}