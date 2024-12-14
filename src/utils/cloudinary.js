import { v2 as cloudinary} from "cloudinary"
import fs from "fs"
import { ApiError } from "./ApiError.js";
import { URL } from "url";


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfully
        //console.log("file is uploaded on cloudinary", response.url);
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null
    }
}

const deleteFromCloudinary = async (cloudinaryUrl, resource_type) => {
    try {
        if (!cloudinaryUrl) return null

        const publicId = getPublicIdFromUrl(cloudinaryUrl)

        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resource_type
        })

        return response
    } catch (error) {
        throw new ApiError(400, "Error while deleting the old media") 
    }
}

function getPublicIdFromUrl(url) {
    try {
        // Parse the URL
        const urlObj = new URL(url);

        // Extract the path after "/upload/"
        const pathParts = urlObj.pathname.split("/");
        const uploadIndex = pathParts.indexOf("upload");

        if (uploadIndex !== -1 && pathParts.length > uploadIndex + 1) {
            // Combine remaining parts after "/upload/" and remove version & extension
            const publicIdWithVersion = pathParts.slice(uploadIndex + 1).join("/");
            // Remove the version number (e.g., v1234567890/) and file extension
            const publicId = publicIdWithVersion.replace(/^(v\d+\/)?|(\.[^/.]+)$/g, "");
            return publicId;
        }
        return null; // Return null if "upload" is not found
    } catch (error) {
        console.error("Error parsing URL:", error.message);
        return null;
    }
}




export {
    uploadOnCloudinary,
    deleteFromCloudinary
}