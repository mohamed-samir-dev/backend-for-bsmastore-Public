require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const { deletedCount } = await Product.deleteMany({});
    console.log(`✅ تم مسح ${deletedCount} منتج من الداتابيز`);
  } catch (err) {
    console.error("❌ خطأ:", err.message);
  } finally {
    await mongoose.disconnect();
  }
})();
