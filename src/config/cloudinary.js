// /config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
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
export default cloudinary;