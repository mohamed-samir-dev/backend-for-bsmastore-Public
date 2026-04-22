require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const SOURCE_API = "https://elbalad-ksa-backend-production.up.railway.app/api/products";

function detectColor(name) {
  const colors = ["صحراوي", "رصاصي", "أبيض", "ابيض", "أسود", "اسود"];
  for (const c of colors) if (name.includes(c)) return c;
  return null;
}

function colorsMatch(a, b) {
  const map = { "أبيض": ["أبيض", "ابيض"], "ابيض": ["أبيض", "ابيض"], "أسود": ["أسود", "اسود"], "اسود": ["أسود", "اسود"] };
  if (a === b) return true;
  return (map[a] || [a]).includes(b);
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  const res = await fetch(SOURCE_API);
  const all = await res.json();

  // Source: iPhone 16 Pro Max WITH images
  const srcPM = all.filter(p => p.name && p.name.includes("16") && p.name.includes("برو ماكس") && p.images && p.images.length > 0);
  const srcPro = all.filter(p => p.name && p.name.includes("16") && p.name.includes("برو") && !p.name.includes("ماكس") && p.images && p.images.length > 0);

  // Build color maps
  const pmByColor = {}, proByColor = {};
  for (const p of srcPM) {
    const c = (p.color || detectColor(p.name) || "").trim();
    if (c && !pmByColor[c]) pmByColor[c] = { image: p.image, images: p.images };
  }
  for (const p of srcPro) {
    const c = (p.color || detectColor(p.name) || "").trim();
    if (c && !proByColor[c]) proByColor[c] = { image: p.image, images: p.images };
  }

  console.log("Source PM colors:", Object.keys(pmByColor).map(c => `${c}(${pmByColor[c].images.length})`));
  console.log("Source Pro colors:", Object.keys(proByColor).map(c => `${c}(${proByColor[c].images.length})`));

  // Local products
  const local = await Product.find({ name: { $regex: "16.*برو" } });
  console.log(`\nLocal products: ${local.length}`);

  let updated = 0;
  for (const p of local) {
    const isPM = p.name.includes("ماكس");
    const colorMap = isPM ? pmByColor : proByColor;
    const color = (p.color || detectColor(p.name) || "").trim();

    let src = null;
    for (const [sc, sd] of Object.entries(colorMap)) {
      if (colorsMatch(color, sc)) { src = sd; break; }
    }

    if (!src) {
      console.log(`⚠ No match: ${p.name} (${color})`);
      continue;
    }

    await Product.findByIdAndUpdate(p._id, { image: src.image, images: src.images });
    console.log(`✅ [${isPM ? "PM" : "PRO"}] ${p.name.substring(0, 55)} (${color}) -> ${src.images.length} imgs`);
    updated++;
  }

  console.log(`\n🎉 Done! ${updated}/${local.length}`);
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
