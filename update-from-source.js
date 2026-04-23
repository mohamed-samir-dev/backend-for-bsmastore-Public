require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const SOURCE_API = "https://elbalad-ksa-backend-production.up.railway.app/api/products";

const CATEGORIES = [
  { localRegex: "ايفون 16،", sourceCategory: "ايفون 16", label: "iPhone 16" },
  { localRegex: "15 برو ماكس", sourceCategory: "ابل ايفون 15 برو ماكس", label: "iPhone 15 Pro Max" },
  { localRegex: "15 بلس", sourceCategory: "ابل ايفون 15 بلس", label: "iPhone 15 Plus" },
];

function normalizeStorage(s) {
  if (!s) return "";
  const num = parseInt(s.replace(/[^\d]/g, ""));
  if (isNaN(num)) return "";
  if (/tb|تيرا|نيرا/i.test(s)) return String(num * 1024);
  return String(num);
}

function normalizeColor(c) {
  if (!c) return "";
  const t = c.trim();
  const map = {
    "أسود": "black", "اسود": "black", "أسود تيتانيوم": "black-titanium",
    "أبيض": "white", "ابيض": "white", "أبيض تيتانيوم": "white-titanium",
    "بينك": "pink", "وردي": "pink",
    "أزرق": "blue", "ازرق": "blue",
    "أزرق فاتح": "light-blue", "ازرق فاتح": "light-blue",
    "أزرق تيتانيوم": "blue-titanium", "ازرق تيتانيوم": "blue-titanium",
    "رمادي تيتانيوم": "gray-titanium",
    "صحراوي": "desert",
  };
  return map[t] || t.toLowerCase();
}

function extractColorFromName(name) {
  const colors = [
    ["أسود تيتانيوم", "black-titanium"], ["اسود تيتانيوم", "black-titanium"],
    ["أبيض تيتانيوم", "white-titanium"], ["ابيض تيتانيوم", "white-titanium"],
    ["رمادي تيتانيوم", "gray-titanium"],
    ["أزرق تيتانيوم", "blue-titanium"], ["ازرق تيتانيوم", "blue-titanium"],
    ["أزرق فاتح", "light-blue"], ["ازرق فاتح", "light-blue"],
    ["أسود", "black"], ["اسود", "black"],
    ["أبيض", "white"], ["ابيض", "white"],
    ["بينك", "pink"], ["وردي", "pink"],
    ["أزرق", "blue"], ["ازرق", "blue"],
    ["صحراوي", "desert"],
  ];
  for (const [ar, en] of colors) {
    if (name.includes(ar)) return en;
  }
  return "";
}

function extractStorageFromName(name) {
  const m = name.match(/(\d+)\s*(GB|جيجا|TB|تيرا|نيرا)/i);
  if (!m) return "";
  let val = m[1];
  if (/TB|تيرا|نيرا/i.test(m[2])) val = String(parseInt(val) * 1024);
  return val;
}

function getColor(p) {
  return normalizeColor(p.color) || extractColorFromName(p.name);
}

function getStorage(p) {
  return normalizeStorage(p.storage) || extractStorageFromName(p.name);
}

async function main() {
  const res = await fetch(SOURCE_API);
  const data = await res.json();
  const allSource = Array.isArray(data) ? data : data.products || data.data || [];

  await mongoose.connect(process.env.MONGO_URI);

  let totalUpdated = 0, totalLocal = 0;

  for (const cat of CATEGORIES) {
    const sourceProducts = allSource.filter(p => p.category === cat.sourceCategory);
    const localProducts = await Product.find({
      name: { $regex: cat.localRegex, $options: "i" },
      // exclude sub-categories (e.g. don't match "16 بلس" or "16 برو" when searching "ايفون 16،")
    });

    console.log(`\n━━━ ${cat.label} ━━━`);
    console.log(`📦 Source: ${sourceProducts.length} | 📱 Local: ${localProducts.length}`);

    for (const local of localProducts) {
      const localColor = getColor(local);
      const localStorage = getStorage(local);

      const match = sourceProducts.find(src => {
        return getColor(src) === localColor && getStorage(src) === localStorage;
      });

      if (match) {
        local.image = match.image;
        local.images = match.images;
        local.description = match.description || local.description;
        local.originalPrice = match.originalPrice;
        local.salePrice = match.salePrice;
        if (match.specs) local.specs = match.specs;
        if (match.colors) local.colors = match.colors;
        await local.save();
        totalUpdated++;
        console.log(`  ✅ ${local.name} (${local.images.length} imgs)`);
      } else {
        console.log(`  ⚠️  No match: ${local.name} [${localColor}, ${localStorage}]`);
      }
    }
    totalLocal += localProducts.length;
  }

  console.log(`\n🎉 Done! Updated ${totalUpdated}/${totalLocal} products`);
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
