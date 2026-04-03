require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

async function fixPrices() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  const products = await Product.find({ salePrice: { $exists: true, $ne: null } });
  let fixed = 0;

  for (const p of products) {
    // لو salePrice أكبر من originalPrice يبقى الأسعار معكوسة
    if (p.salePrice > p.originalPrice) {
      const temp = p.originalPrice;
      p.originalPrice = p.salePrice;
      p.salePrice = temp;
      await p.save();
      fixed++;
      console.log(`Fixed: ${p.name} → salePrice: ${p.salePrice}, originalPrice: ${p.originalPrice}`);
    }
  }

  console.log(`\nDone! Fixed ${fixed} products.`);
  await mongoose.disconnect();
}

fixPrices().catch(console.error);
