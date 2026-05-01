require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const SOURCE_URL = "https://elbalad-ksa-backend-production.up.railway.app/api/products";

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  console.log("Fetching products from:", SOURCE_URL);
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

  const data = await res.json();
  // handle both array and { products: [...] } shapes
  const products = Array.isArray(data) ? data : data.products || [];
  console.log(`Fetched ${products.length} products`);

  if (!products.length) {
    console.log("No products to import.");
    return process.exit(0);
  }

  // strip _id and __v so Mongo generates new ones
  const cleaned = products.map(({ _id, __v, ...rest }) => rest);

  const result = await Product.insertMany(cleaned, { ordered: false });
  console.log(`Inserted ${result.length} products successfully!`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
