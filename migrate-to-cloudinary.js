require("dotenv").config();
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const connectDB = require("./config/db");
const Company = require("./models/Company");
const Banner = require("./models/Banner");
const Product = require("./models/Product");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const UPLOADS_DIR = path.join(__dirname, "uploads");

async function uploadFile(localUrl, folder, resource_type = "image") {
  if (!localUrl || !localUrl.startsWith("/uploads/")) return localUrl;
  const filename = localUrl.replace("/uploads/", "");
  const filePath = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  ملف مش موجود: ${filename}`);
    return localUrl;
  }
  try {
    const result = await cloudinary.uploader.upload(filePath, { folder, resource_type, use_filename: true, unique_filename: true });
    console.log(`  ✅ ${filename} → ${result.secure_url}`);
    return result.secure_url;
  } catch (e) {
    console.log(`  ❌ فشل رفع ${filename}: ${e.message}`);
    return localUrl;
  }
}

async function migrate() {
  await connectDB();
  console.log("\n=== بدء الترحيل ===\n");

  // ── Company ──
  console.log("📦 Company...");
  const company = await Company.findOne();
  if (company) {
    company.logo    = await uploadFile(company.logo,    "company");
    company.header  = await uploadFile(company.header,  "company");
    company.footer  = await uploadFile(company.footer,  "company");
    company.stamp   = await uploadFile(company.stamp,   "company");
    company.qrImage = await uploadFile(company.qrImage, "company");
    company.img1    = await uploadFile(company.img1,    "company");
    company.img2    = await uploadFile(company.img2,    "company");
    company.file1   = await uploadFile(company.file1,   "docs", "raw");
    company.file2   = await uploadFile(company.file2,   "docs", "raw");

    for (let i = 0; i < company.footerItems.length; i++) {
      company.footerItems[i].image = await uploadFile(company.footerItems[i].image, "company");
      company.footerItems[i].file  = await uploadFile(company.footerItems[i].file,  "docs", "raw");
    }
    company.markModified("footerItems");
    await company.save();
  }

  // ── Banners ──
  console.log("\n🖼️  Banners...");
  const bannerDoc = await Banner.findOne();
  if (bannerDoc) {
    for (let i = 0; i < bannerDoc.banners.length; i++) {
      const newUrl = await uploadFile(bannerDoc.banners[i].url, "banners");
      bannerDoc.banners.set(i, { url: newUrl, active: bannerDoc.banners[i].active });
    }
    await bannerDoc.save();
  }

  // ── Products ──
  console.log("\n🛍️  Products...");
  const products = await Product.find({ image: /^\/uploads\// });
  console.log(`  وجد ${products.length} منتج بصور محلية`);
  for (const product of products) {
    product.image = await uploadFile(product.image, "products");
    if (product.images?.length) {
      product.images = await Promise.all(product.images.map(img => uploadFile(img, "products")));
    }
    await product.save();
  }

  console.log("\n=== ✅ انتهى الترحيل ===\n");
  process.exit(0);
}

migrate().catch((e) => { console.error(e); process.exit(1); });
