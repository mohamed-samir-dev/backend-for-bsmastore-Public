const Product = require("../models/Product");

function normalizeArabic(str) {
  return str
    .replace(/[أإآا]/g, "ا")
    .replace(/[ىي]/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي");
}

exports.getProducts = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json(await Product.find());

  const normalized = normalizeArabic(q);
  const products = await Product.find();
  const filtered = products.filter((p) =>
    normalizeArabic(p.name).includes(normalized)
  );
  res.json(filtered);
};

exports.getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

exports.createProduct = async (req, res) => {
  const { originalPrice, salePrice } = req.body;
  if (salePrice && Number(salePrice) >= Number(originalPrice))
    return res.status(400).json({ error: "سعر البيع يجب أن يكون أقل من السعر الأصلي" });
  const product = await Product.create(req.body);
  res.status(201).json(product);
};

exports.updateProduct = async (req, res) => {
  const { originalPrice, salePrice } = req.body;
  if (salePrice && Number(salePrice) >= Number(originalPrice))
    return res.status(400).json({ error: "سعر البيع يجب أن يكون أقل من السعر الأصلي" });
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

exports.deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ message: "Product deleted" });
};
