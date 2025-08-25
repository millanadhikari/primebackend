import { ProjectsModel } from "../models/projectsModel.js";

export class ProjectsService {
    static async createProject({ name, description, assignedUsers }) {
        console.log('data', name, description, assignedUsers)
        try {
            if (!name || !description) {
                throw new Error('All fields are required');
            }

            // Logic to create a project in the database
            // Assuming you have a Project model
            const newProject = await ProjectsModel.createProject({ name, description, assignedUsers });

            return newProject;
        } catch (error) {
            console.error('Error creating project:', error);
            throw error; // Propagate the error to be handled by the controller
        }
    }
    static async getAllProjects() {
        try {
            const projects = await ProjectsModel.getAll();
            return projects;
        } catch (error) {
            console.error('Error fetching projects:', error);
            throw error; // Propagate the error to be handled by the controller
        }
    }

    static async getProjectById(id) {
        try {
            const project = await ProjectsModel.findById(id);
            if (!project) {
                throw new Error('Project not found');
            }
            return project;
        } catch (error) {
            console.error('Error fetching project by ID:', error);
            throw error; // Propagate the error to be handled by the controller
        }
    }



    static async updateProject(id, updateData) {
        try {
            // Logic to update a project in the database
            const updatedProject = await ProjectsModel.updateProject(id, updateData);
            return updatedProject;
        } catch (error) {
            console.error('Error updating project:', error);
            throw error; // Propagate the error to be handled by the controller
        }


    }

    static async deleteProject(id) {
        try {
            // Logic to delete a project in the database
            const deletedProject = await ProjectsModel.deleteProject(id);
            return deletedProject;
        } catch (error) {
            console.error('Error deleting project:', error);
            throw error; // Propagate the error to be handled by the controller
        }
    }
}