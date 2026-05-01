require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const products = await Product.find({
      $or: [
        { category: { $regex: /S23|s23|اس 23|جالاكسي.*23/i } },
        { name: { $regex: /S23|s23|اس 23|جالاكسي.*23/i } },
      ],
    });

    if (!products.length) {
      console.log("❌ مفيش منتجات سامسونج جالاكسي S23 Ultra");
    } else {
      console.log(`\n📱 منتجات سامسونج جالاكسي S23 Ultra (${products.length} منتج):\n`);
      products.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}`);
        console.log(`   اللون: ${p.color || "—"}`);
        console.log(`   السعر الأصلي: ${p.originalPrice} ريال`);
        console.log(`   سعر البيع: ${p.salePrice || "—"} ريال`);
        console.log(`   التخزين: ${p.storage}`);
        console.log(`   ID: ${p._id}`);
        console.log("");
      });
      console.log("\n📋 JSON كامل:\n");
      console.log(JSON.stringify(products, null, 2));
    }
  } catch (err) {
    console.error("❌ خطأ:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
