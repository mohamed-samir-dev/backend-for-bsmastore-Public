require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const SOURCE_API = "https://elbalad-ksa-backend-production.up.railway.app/api/products";

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const res = await fetch(SOURCE_API);
  const allSource = await res.json();
  const sourceProducts = allSource.filter(
    (p) => p.name && p.name.includes("17") && p.name.includes("برو ماكس")
  );

  const sourceByColor = {};
  for (const p of sourceProducts) {
    const color = (p.color || "").trim();
    if (color && !sourceByColor[color]) {
      sourceByColor[color] = { image: p.image, images: p.images || [] };
    }
  }

  // The 3 products with empty color - detect from name
  const ids = [
    "69cef500a8731a9af7571e30", // أزرق in name
    "69cfaabec020709c5671d699", // سيلفر in name
    "69cfab13c020709c5671d6a9", // سيلفر in name
  ];

  const colorDetect = { "أزرق": "ازرق", "ازرق": "ازرق", "سيلفر": "سيلفر", "برتقالي": "برتقالي" };

  for (const id of ids) {
    const p = await Product.findById(id);
    if (!p) continue;

    let detectedColor = null;
    for (const [key, mapped] of Object.entries(colorDetect)) {
      if (p.name.includes(key)) { detectedColor = mapped; break; }
    }

    if (detectedColor && sourceByColor[detectedColor]) {
      const src = sourceByColor[detectedColor];
      await Product.findByIdAndUpdate(id, { image: src.image, images: src.images });
      console.log(`✅ Fixed: ${p.name} -> ${detectedColor} (${src.images.length} images)`);
    } else {
      console.log(`⚠ Could not fix: ${p.name}`);
    }
  }

  console.log("Done!");
  await mongoose.disconnect();
}

main().catch(console.error);
