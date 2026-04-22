require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB"); 

  const result = await Product.updateMany(
    { salePrice: 0 },
    { $unset: { salePrice: "" } }
  );

  console.log(`Fixed ${result.modifiedCount} products (removed salePrice=0)`);
  await mongoose.disconnect();
}

fix().catch(console.error);
