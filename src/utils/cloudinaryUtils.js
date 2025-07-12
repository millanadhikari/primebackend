/**
 * Given a Cloudinary URL (or stored public ID), return the public ID
 * so that cloudinary.uploader.destroy(publicId) will work.
 *
 * Examples:
 *   extractPublicId("https://res.cloudinary.com/yourcloud/image/upload/v12345/folder/abcde.jpg")
 *     -> "folder/abcde"
 *
 *   extractPublicId("folder/abcde")   // if you already stored just the publicId
 *     -> "folder/abcde"
 */
export function extractPublicId(input) {
    if (!input) return null;

    // If it already looks like a publicId (no protocol), return it
    if (!input.startsWith("http")) {
        // strip file extension if present
        return input.replace(/\.(jpg|jpeg|png|gif|pdf|docx?)$/i, "");
    }

    try {
        const url = new URL(input);
        // path looks like: /yourcloud/image/upload/v12345/folder/abcde.jpg
        const parts = url.pathname.split("/");
        // find the "upload" segment, then everything after is publicId + ext
        const uploadIndex = parts.findIndex((p) => p === "upload");
        const publicPath = parts.slice(uploadIndex + 1).join("/");
        // remove version prefix (v12345/) and file extension
        return publicPath.replace(/^v\d+\//, "").replace(/\.[^/.]+$/, "");
    } catch {
        return null;
    }
}
