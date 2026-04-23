require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const SOURCE_API = "https://elbalad-ksa-backend-production.up.railway.app/api/products";

function normalizeColor(c) {
  if (!c) return "";
  const map = { "أسود": "black", "اسود": "black", "أبيض": "white", "ابيض": "white", "بنفسجي": "purple", "أحمر": "red", "احمر": "red" };
  return map[c.trim()] || c.trim();
}
function normalizeStorage(s) {
  if (!s) return "";
  const num = parseInt(s.replace(/[^\d]/g, ""));
  return isNaN(num) ? "" : String(num);
}
function getColor(p) { return normalizeColor(p.color) || ""; }
function getStorage(p) { return normalizeStorage(p.storage) || ""; }

async function main() {
  const res = await fetch(SOURCE_API);
  const data = await res.json();
  const all = Array.isArray(data) ? data : data.products || data.data || [];

  await mongoose.connect(process.env.MONGO_URI);

  // === iPhone 14 Pro Max ===
  console.log("\n━━━ iPhone 14 Pro Max ━━━");
  const srcProMax = all.filter(p => p.name && p.name.includes("14 برو ماكس"));
  const localProMax = await Product.find({ name: { $regex: "14 برو ماكس", $options: "i" } });
  console.log(`📦 Source: ${srcProMax.length} | 📱 Local: ${localProMax.length}`);

  for (const local of localProMax) {
    const lc = getColor(local), ls = getStorage(local);
    let match = srcProMax.find(s => getColor(s) === lc && getStorage(s) === ls);
    // أبيض مفيش في السورس، نستخدم أسود بنفس الـ storage
    if (!match) match = srcProMax.find(s => getStorage(s) === ls);
    // لو لسه مفيش، نستخدم أي حاجة عندها صور
    if (!match) match = srcProMax.find(s => s.images && s.images.length > 0);
    if (match) {
      local.image = match.image;
      local.images = match.images && match.images.length > 0 ? match.images : [match.image];
      local.description = match.description || local.description;
      local.originalPrice = match.originalPrice;
      local.salePrice = match.salePrice;
      await local.save();
      console.log(`  ✅ ${local.name} (${local.images.length} imgs)`);
    } else {
      console.log(`  ⚠️  No match: ${local.name}`);
    }
  }

  // === iPhone 14 Pro ===
  console.log("\n━━━ iPhone 14 Pro ━━━");
  const srcPro = all.filter(p => p.name && p.name.includes("14 برو") && !p.name.includes("ماكس"));
  const localPro = await Product.find({ name: { $regex: "14 برو", $options: "i" }, name: { $not: /ماكس/ } });
  console.log(`📦 Source: ${srcPro.length} | 📱 Local: ${localPro.length}`);

  for (const local of localPro) {
    const lc = getColor(local), ls = getStorage(local);
    let match = srcPro.find(s => getColor(s) === lc && getStorage(s) === ls);
    if (!match) match = srcPro.find(s => getColor(s) === lc);
    if (match) {
      local.image = match.image;
      // السورس الجاليري فاضي، نحط الصورة الرئيسية كجاليري
      local.images = match.images && match.images.length > 0 ? match.images : [match.image];
      local.description = match.description || local.description;
      local.originalPrice = match.originalPrice;
      local.salePrice = match.salePrice;
      await local.save();
      console.log(`  ✅ ${local.name} (${local.images.length} imgs)`);
    } else {
      console.log(`  ⚠️  No match: ${local.name}`);
    }
  }

  console.log("\n🎉 Done!");
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
