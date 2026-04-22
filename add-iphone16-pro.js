require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const SOURCE_API = "https://elbalad-ksa-backend-production.up.railway.app/api/products";

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  const res = await fetch(SOURCE_API);
  const all = await res.json();
  const sources = all.filter(
    (p) => p.name && p.name.includes("16") && p.name.includes("برو") && !p.name.includes("ماكس") && p.images && p.images.length > 0
  );

  console.log(`Found ${sources.length} iPhone 16 Pro on elbalad`);

  let created = 0;
  for (const s of sources) {
    // Remove _id, id, __v, virtuals so MongoDB creates new ones
    const { _id, id, __v, createdAt, updatedAt, discountPercent, price, ...data } = s;
    const product = await Product.create(data);
    console.log(`✅ Created: ${product.name} (${product.color}) -> ${product.images.length} imgs`);
    created++;
  }

  console.log(`\n🎉 Done! Created ${created} products`);
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
