// /config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import prisma from "./database.js";
// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });

cloudinary.config({
    cloud_name: 'dgrcwlvx2',
    api_key: "336426224285731",
    api_secret: 'Jf3EheYBVIzjvBhrhyLPxVgNhmw',
});
/**
 * Determines resource type based on file extension.
 * @param {string} publicId
 * @returns {"image" | "raw" | "video"}
 */
function detectResourceType(publicId) {
    const ext = publicId.split('.').pop()?.toLowerCase();

    if (!ext) return "image"; // fallback

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
    if (["mp4", "mov", "avi", "mkv"].includes(ext)) return "video";
    if (["pdf", "doc", "docx", "xls", "xlsx", "csv", "txt", "zip"].includes(ext)) return "raw";

    return "image"; // default fallback
}

/**
 * Deletes a file from Cloudinary with detected resource type.
 * @param {string} publicId - e.g. "crm_uploads/filename.pdf"
 */
export async function deleteFileFromCloudinary(publicId) {
    const resourceType = detectResourceType(publicId);

    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });
        return result;
    } catch (error) {
        console.error("Cloudinary delete error:", error);
        throw error;
    }
}
export async function getCloudinaryUsage() {
    const cloud_name = 'dgrcwlvx2';
    const api_key = '336426224285731';
    const api_secret = 'Jf3EheYBVIzjvBhrhyLPxVgNhmw';

    const authString = `${api_key}:${api_secret}`;
    const base64Auth = Buffer.from(authString).toString('base64'); // Only works server-side

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/usage`, {
        headers: {
            Authorization: `Basic ${base64Auth}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Cloudinary usage fetch failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(data)

    const usedGB = (data.storage.usage / 1_073_741_824).toFixed(2);
    const limitGB = (data.storage.limit / 1_073_741_824).toFixed(2);

    return data;
}

// utils/neon.ts
export async function getNeonUsage() {
    try {
        // Get database size in bytes
        const dbSizeResult = await prisma.$queryRawUnsafe(
            `SELECT pg_database_size(current_database()) AS bytes`
        );
        const dbSize = parseInt(dbSizeResult[0].bytes, 10);

        // Get number of active connections
        const connResult = await prisma.$queryRawUnsafe(
            `SELECT COUNT(*)::int FROM pg_stat_activity`
        );
        const activeConnections = connResult[0].count;

        // Return usage data
        return ({
            project_name: "My Neon Project",
            last_updated: new Date().toISOString(),
            storage: {
                usage: dbSize,
                limit: 10 * 1024 * 1024 * 1024, // 10 GB = Free Tier storage limit
            },
            bandwidth: {
                usage: 0, // Neon doesn't expose this via SQL
                limit: 0,
            },
            active_connections: {
                usage: activeConnections,
                limit: 100, // Free tier allows up to 100 connections
            },
        });
    } catch (error) {
        console.error("❌ Failed to fetch Neon usage:", error);
        // status(500).json({ error: "Failed to retrieve usage data" });
    }
}



export default cloudinary;