// import multer from "multer";
// import { v2 as cloudinary } from "cloudinary";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import dotenv from "dotenv";

// dotenv.config();

// // 🔹 Configure Cloudinary (Only in One Place)
// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // 🔹 Storage for Profile Images (Only JPEG & PNG)
// const profileStorage = new CloudinaryStorage({
//     cloudinary,
//     params: {
//         folder: "profiles",
//         resource_type: "image",
//         allowed_formats: ["jpeg", "png"], // ✅ Only allow profile images
//     },
// });
// export const uploadProfileImage = multer({ storage: profileStorage });

// // 🔹 Storage for General Files (Supports PDFs, Videos, etc.)
// const fileStorage = new CloudinaryStorage({
//     cloudinary,
//     params: (req, file) => {
//         let resourceType = "auto"; // Default
        
//         if (file.mimetype === "application/pdf" || file.mimetype.includes("video")) {
//             resourceType = "raw"; // ✅ Fix PDF Uploads
//         }
        
//         return {
//             folder: "uploads",
//             resource_type: resourceType, 
//             allowed_formats: ["jpg", "jpeg", "png", "pdf", "docx", "mp4"], // ✅ Supports multiple formats
//         };
//     },
// });
// export const uploadSingleFile = multer({ storage: fileStorage });
