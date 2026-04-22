require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const SOURCE_API = "https://elbalad-ksa-backend-production.up.railway.app/api/products";

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  // Fetch source products
  const res = await fetch(SOURCE_API);
  const allSource = await res.json();
  const sourceProducts = allSource.filter(
    (p) => p.name && p.name.includes("17") && p.name.includes("برو ماكس")
  );
  console.log(`Found ${sourceProducts.length} iPhone 17 Pro Max on elbalad`);

  // Group source by color -> pick first match for image/images
  const sourceByColor = {};
  for (const p of sourceProducts) {
    const color = (p.color || "").trim();
    if (color && !sourceByColor[color]) {
      sourceByColor[color] = { image: p.image, images: p.images || [] };
    }
  }
  console.log("Source colors:", Object.keys(sourceByColor));

  // Get local products
  const localProducts = await Product.find({
    name: { $regex: "17.*برو ماكس" },
  });
  console.log(`Found ${localProducts.length} local iPhone 17 Pro Max products`);

  // Color mapping (local color -> source color)
  const colorMap = {
    "أزرق": "ازرق",
    "ازرق": "ازرق",
    "برتقالي": "برتقالي",
    "سيلفر": "سيلفر",
  };

  let updated = 0;
  for (const local of localProducts) {
    const localColor = (local.color || "").trim();
    const mappedColor = colorMap[localColor] || localColor;
    const source = sourceByColor[mappedColor] || sourceByColor[localColor];

    if (!source) {
      console.log(`⚠ No source match for "${local.name}" (color: ${localColor})`);
      continue;
    }

    await Product.findByIdAndUpdate(local._id, {
      image: source.image,
      images: source.images,
    });
    console.log(`✅ Updated: ${local.name} (${localColor}) -> ${source.images.length} images`);
    updated++;
  }

  console.log(`\nDone! Updated ${updated}/${localProducts.length} products`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
