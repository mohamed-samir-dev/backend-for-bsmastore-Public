const API = "https://elbalad-ksa-backend-production.up.railway.app/api/products";

// صور ايفون 16 بلس حسب اللون
const imagesByColor = {
  black: {
    image: "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894753/Apple-IPhone-16-With-FaceTime-128GB-8GB-RAM_3922_1_rbllne.avif",
    images: [
      "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894753/Apple-IPhone-16-With-FaceTime-128GB-8GB-RAM_3922_1_rbllne.avif",
      "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894317/iPhone_16_Black_PDP_Image_Position_2__en-ME-scaled_myxb2l.avif",
      "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894344/iPhone_16_Black_PDP_Image_Position_3__en-ME-scaled_d9lcbh.avif",
      "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894315/iPhone_16_Black_PDP_Image_Position_4__en-ME-scaled_zbnbis.avif",
      "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894316/iPhone_16_Black_PDP_Image_Position_8__en-ME-scaled_wlgcim.avif",
    ],
  },
  pink: {
    image: "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894316/iPhone_16_Pink_PDP_Image_Position_1__en-ME-scaled_eisivk.avif",
    images: [
      "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894316/iPhone_16_Pink_PDP_Image_Position_1__en-ME-scaled_eisivk.avif",
      "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894316/iPhone_16_Pink_PDP_Image_Position_2__en-ME-scaled_jeqh66.avif",
      "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894362/iPhone_16_Pink_PDP_Image_Position_3__en-ME-scaled_tz7ene.avif",
      "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894317/iPhone_16_Pink_PDP_Image_Position_4__en-ME-scaled_v3dxvv.avif",
      "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894315/iPhone_16_Pink_PDP_Image_Position_8__en-ME-scaled_eanpkr.avif",
    ],
  },
  white: {
    image: "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894317/Apple-IPhone-16-With-FaceTime-128GB-8GB-RAM_3921_1_1_q5m4xb.jpg",
    images: [
      "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894317/Apple-IPhone-16-With-FaceTime-128GB-8GB-RAM_3921_1_1_q5m4xb.jpg",
      "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894316/iPhone_16_White_PDP_Image_Position_2__en-ME-scaled_prentc.avif",
      "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894359/iPhone_16_White_PDP_Image_Position_3__en-ME-scaled_xg5moe.avif",
      "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894319/iPhone_16_White_PDP_Image_Position_4__en-ME-scaled_c0used.avif",
      "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894315/iPhone_16_White_PDP_Image_Position_8__en-ME-scaled_zcjiyw.avif",
    ],
  },
};

function getColorKey(color) {
  const c = color.toLowerCase();
  if (c.includes("أسود") || c.includes("اسود") || c.includes("black")) return "black";
  if (c.includes("بينك") || c.includes("بنك") || c.includes("وردي") || c.includes("pink")) return "pink";
  if (c.includes("أبيض") || c.includes("ابيض") || c.includes("white")) return "white";
  return null;
}

async function main() {
  console.log("⏳ جاري جلب المنتجات...");
  const res = await fetch(API);
  const products = await res.json();

  const iphone16Plus = products.filter((p) => {
    const cat = (p.category || "").toLowerCase();
    const name = (p.name || "").toLowerCase();
    return cat.includes("16") && cat.includes("بلس") || name.includes("16 بلس") || name.includes("16 plus");
  });

  console.log(`✅ تم العثور على ${iphone16Plus.length} منتج ايفون 16 بلس\n`);

  for (const product of iphone16Plus) {
    const colorKey = getColorKey(product.color || "");
    if (!colorKey) {
      console.log(`⚠️  تخطي "${product.name}" - لون غير معروف: ${product.color}`);
      continue;
    }

    const imgs = imagesByColor[colorKey];
    console.log(`🔄 تحديث: ${product.name} (${product._id}) - لون: ${colorKey}`);

    const updateRes = await fetch(`${API}/${product._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imgs.image, images: imgs.images }),
    });

    if (updateRes.ok) {
      console.log(`   ✅ تم التحديث بنجاح`);
    } else {
      console.log(`   ❌ فشل التحديث: ${updateRes.status} ${updateRes.statusText}`);
    }
  }

  console.log("\n🎉 انتهى التحديث!");
}

main().catch(console.error);
