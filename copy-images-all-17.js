require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const SOURCE_API = "https://elbalad-ksa-backend-production.up.railway.app/api/products";

// Normalize color for matching
function normalizeColor(c) {
  return (c || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace("أزرق فاتح", "أزرق فاتح")
    .replace("سيبفلر", "سيلفر"); // typo fix
}

const COLOR_ALIASES = {
  "أزرق": ["أزرق", "ازرق"],
  "ازرق": ["أزرق", "ازرق"],
  "أسود": ["أسود", "اسود"],
  "اسود": ["أسود", "اسود"],
  "أبيض": ["أبيض", "ابيض"],
  "سيلفر": ["سيلفر", "سيبفلر"],
  "سيبفلر": ["سيلفر"],
  "برتقالي": ["برتقالي"],
  "برتقالي ": ["برتقالي"],
  "أزرق فاتح": ["أزرق فاتح"],
  "بينك": ["بينك"],
  "جولد": ["جولد"],
  "أبيض ": ["أبيض"],
};

function colorsMatch(a, b) {
  const na = normalizeColor(a);
  const nb = normalizeColor(b);
  if (na === nb) return true;
  const aliases = COLOR_ALIASES[na] || [na];
  return aliases.includes(nb);
}

function categorize(name) {
  if (name.includes("برو ماكس")) return "PM";
  if (name.includes("برو")) return "PRO";
  if (name.includes("اير")) return "AIR";
  return "PLAIN";
}

// Detect color from product name
function detectColorFromName(name) {
  const colors = ["أزرق فاتح", "أزرق", "ازرق", "برتقالي", "سيلفر", "أسود", "اسود", "أبيض", "بينك", "جولد"];
  for (const c of colors) {
    if (name.includes(c)) return c;
  }
  return null;
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  const res = await fetch(SOURCE_API);
  const allSource = await res.json();

  // Build source image maps per category per color
  const sourceMaps = { PRO: {}, AIR: {}, PLAIN: {} };

  for (const p of allSource) {
    if (!p.name || !p.name.includes("17")) continue;
    const cat = categorize(p.name);
    if (cat === "PM") continue; // already done

    const color = normalizeColor(p.color || detectColorFromName(p.name));
    if (!color || !sourceMaps[cat]) continue;

    if (!sourceMaps[cat][color]) {
      sourceMaps[cat][color] = { image: p.image, images: p.images || [] };
    }
  }

  for (const [cat, colors] of Object.entries(sourceMaps)) {
    console.log(`\nSource ${cat} colors:`, Object.keys(colors).map(c => `${c} (${colors[c].images.length} imgs)`));
  }

  // Get local products (not Pro Max)
  const localProducts = await Product.find({ name: { $regex: "17" } });
  const targets = localProducts.filter((p) => {
    const cat = categorize(p.name);
    return cat !== "PM"; // skip Pro Max (already done)
  });

  console.log(`\nFound ${targets.length} local products to update`);

  let updated = 0;
  for (const local of targets) {
    const cat = categorize(local.name);
    const colorMap = sourceMaps[cat];
    if (!colorMap) continue;

    const localColor = normalizeColor(local.color || detectColorFromName(local.name));
    if (!localColor) {
      console.log(`⚠ No color detected: ${local.name}`);
      continue;
    }

    // Find matching source
    let source = null;
    for (const [srcColor, srcData] of Object.entries(colorMap)) {
      if (colorsMatch(localColor, srcColor)) {
        source = srcData;
        break;
      }
    }

    if (!source) {
      console.log(`⚠ No source for ${cat} "${localColor}": ${local.name}`);
      continue;
    }

    await Product.findByIdAndUpdate(local._id, {
      image: source.image,
      images: source.images,
    });
    console.log(`✅ [${cat}] ${local.name.substring(0, 55)} (${localColor}) -> ${source.images.length} imgs`);
    updated++;
  }

  console.log(`\n🎉 Done! Updated ${updated}/${targets.length} products`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
