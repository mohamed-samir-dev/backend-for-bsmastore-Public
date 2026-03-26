const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function makeImageUpload(folderName) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: { folder: folderName, allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"] },
  });
  return multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
}

function makeFileUpload(folderName) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: { folder: folderName, resource_type: "raw", allowed_formats: ["pdf", "doc", "docx"], type: "upload", flags: "attachment:false" },
  });
  return multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });
}

async function deleteFromCloudinary(url, resource_type = "image") {
  if (!url || !url.includes("cloudinary.com")) return;
  try {
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    // remove version segment if present (v1234567)
    let pathParts = parts.slice(uploadIndex + 1);
    if (/^v\d+$/.test(pathParts[0])) pathParts = pathParts.slice(1);
    const publicId = pathParts.join("/").replace(/\.[^/.]+$/, "");
    await cloudinary.uploader.destroy(publicId, { resource_type });
  } catch (e) {
    console.error("Cloudinary delete error:", e.message);
  }
}

module.exports = { cloudinary, makeImageUpload, makeFileUpload, deleteFromCloudinary };
