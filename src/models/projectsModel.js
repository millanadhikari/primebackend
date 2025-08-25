import prisma from "../config/database.js";
import { ActivitiesModel } from "./activitiesModel.js";

export class ProjectsModel {
    static async createProject({ name, description, assignedUsers }) {
        try {

            if (!name || !Array.isArray(assignedUsers)) {
                throw new Error("Name and assignedUsers array required");
            }

            const project = await prisma.project.create({
                data: {
                    name,
                    description,
                    assignedUsers: {
                        connect: assignedUsers.map((id) => ({ id })),
                    },
                },
                include: { assignedUsers: true },
            });

            await ActivitiesModel.createActivity({
                type: "PROJECT_ADDED",
                description: `New project created`,
                userId: project.name, // Replace with actual admin ID or context
                userRole: 'ADMIN',
                userName: `${project.name} `,

                status: "INFO",
                targetType: "crm",
                targetId: 'kanban',
            });


            return project;
        } catch (error) {
            console.error("Create project error:", error);
            throw new Error('Failed to create project');
        }
    }
    static async getAll() {
        try {
            const projects = await prisma.Project.findMany({
                include: {
                    assignedUsers: true,
                    tasks: true,
                },
            });
            return projects;
        } catch (error) {
            console.error("Get all projects error:", error);
            throw new Error("Failed to fetch projects");
        }
    }

    static async findById(id) {
        try {
            const project = await prisma.project.findUnique({
                where: { id },
                include: { assignedUsers: true, tasks: true },
            });
            return project;
        } catch (error) {
            console.error("Find project by ID error:", error);
            throw new Error("Failed to fetch project by ID");
        }
    }
    static async updateProject(id, updateData) {
        try {
            const project = await prisma.project.update({
                where: { id },
                data: updateData,
                include: { assignedUsers: true },
            });
            return project;
        } catch (error) {
            console.error("Update project error:", error);
            throw new Error("Failed to update project");
        }
    }

    static async deleteProject(id) {
        try {
            const project = await prisma.project.delete({
                where: { id },
            });
            return project;
        } catch (error) {
            console.error("Delete project error:", error);
            throw new Error("Failed to delete project");
        }
    }
}