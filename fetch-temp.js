require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const products = await Product.find({
      name: { $regex: "17 برو", $options: "i" },
      name: { $not: /ماكس/, $regex: "17 برو", $options: "i" },
    }).lean();
    console.log("عدد:", products.length);
    console.log(JSON.stringify(products, null, 2));
  } catch (err) {
    console.error("❌", err.message ?? err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
