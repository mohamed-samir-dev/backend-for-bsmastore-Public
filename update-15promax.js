require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const SOURCE_API = "https://elbalad-ksa-backend-production.up.railway.app/api/products";

function normalizeColor(c) {
  if (!c) return "";
  const map = {
    "أسود تيتانيوم": "black-ti", "اسود تيتانيوم": "black-ti",
    "أبيض تيتانيوم": "white-ti", "ابيض تيتانيوم": "white-ti",
    "رمادي تيتانيوم": "gray-ti", "أزرق تيتانيوم": "blue-ti",
  };
  return map[c.trim()] || c.trim();
}

function extractColor(name) {
  const list = [
    ["أسود تيتانيوم", "black-ti"], ["رمادي تيتانيوم", "gray-ti"],
    ["أبيض تيتانيوم", "white-ti"], ["أزرق تيتانيوم", "blue-ti"],
  ];
  for (const [ar, en] of list) if (name.includes(ar)) return en;
  return "";
}

function getColor(p) { return normalizeColor(p.color) || extractColor(p.name); }

async function main() {
  const res = await fetch(SOURCE_API);
  const data = await res.json();
  const all = Array.isArray(data) ? data : data.products || data.data || [];
  const src = all.filter(p => p.category === "ابل ايفون 15 برو ماكس");
  console.log("Source:", src.length);

  await mongoose.connect(process.env.MONGO_URI);
  const locals = await Product.find({ name: { $regex: "15 برو ماكس", $options: "i" } });
  console.log("Local:", locals.length);

  for (const local of locals) {
    const lc = getColor(local);
    let match = src.find(s => getColor(s) === lc);
    // أزرق تيتانيوم مفيش في السورس، نستخدم أسود تيتانيوم
    if (!match && lc === "blue-ti") match = src.find(s => getColor(s) === "black-ti");
    if (match) {
      local.image = match.image;
      local.images = match.images;
      local.description = match.description || local.description;
      local.originalPrice = match.originalPrice;
      local.salePrice = match.salePrice;
      if (match.specs) local.specs = match.specs;
      if (match.colors) local.colors = match.colors;
      await local.save();
      console.log("OK:", local.name, "->", local.images.length, "imgs");
    } else {
      console.log("SKIP:", local.name, "[" + lc + "]");
    }
  }
  console.log("Done!");
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
