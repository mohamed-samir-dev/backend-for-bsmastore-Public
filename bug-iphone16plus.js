require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const iphone16plus = [
  {
    _id: "69ea542847825c3bcd5b7860",
    name: "ايفون 16 بلس، 5G، أسود، 512 جيجا",
    originalPrice: 2699,
    salePrice: 2500,
    description: "الشروط الواجب توفرها للتقديم:\r\n\r\n• مواطن سعودي او مقيم بإقامة سارية.\r\n• اتمام سداد الدفعة المقدمة لتأكيد الطلب.\r\n• تقديم بيانات صحيحة للتواصل والمتابعة.\r\n• توقيع عقد الأقساط عند استلام الجهاز.\r\n• الالتزام بسداد القسط الشهري في موعده.",
    image: "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894753/Apple-IPhone-16-With-FaceTime-128GB-8GB-RAM_3922_1_rbllne.avif",
    images: [
      "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894753/Apple-IPhone-16-With-FaceTime-128GB-8GB-RAM_3922_1_rbllne.avif",
      "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894317/iPhone_16_Black_PDP_Image_Position_2__en-ME-scaled_myxb2l.avif",
      "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894315/iPhone_16_Black_PDP_Image_Position_4__en-ME-scaled_zbnbis.avif",
      "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894344/iPhone_16_Black_PDP_Image_Position_3__en-ME-scaled_d9lcbh.avif",
      "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894316/iPhone_16_Black_PDP_Image_Position_8__en-ME-scaled_wlgcim.avif",
    ],
    color: "",
    storage: "512 GB",
    network: "",
    screenSize: "",
    category: "ايفون 16 بلس",
    subCategory: "",
    brand: "",
    inStock: true,
    freeDelivery: true,
    deliveryTime: "24 ساعة",
    warrantyYears: 2,
    taxIncluded: true,
  },
  {
    _id: "69ea542847825c3bcd5b7861",
    name: "ايفون 16 بلس، 5G، أسود، 1نيرا",
    originalPrice: 6000,
    salePrice: 6500,
    description: "الشروط الواجب توفرها للتقديم:\r\n\r\n• مواطن سعودي او مقيم بإقامة سارية.\r\n• اتمام سداد الدفعة المقدمة لتأكيد الطلب.\r\n• تقديم بيانات صحيحة للتواصل والمتابعة.\r\n• توقيع عقد الأقساط عند استلام الجهاز.\r\n• الالتزام بسداد القسط الشهري في موعده.",
    image: "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894753/Apple-IPhone-16-With-FaceTime-128GB-8GB-RAM_3922_1_rbllne.avif",
    images: [
      "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894753/Apple-IPhone-16-With-FaceTime-128GB-8GB-RAM_3922_1_rbllne.avif",
      "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894317/iPhone_16_Black_PDP_Image_Position_2__en-ME-scaled_myxb2l.avif",
      "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894315/iPhone_16_Black_PDP_Image_Position_4__en-ME-scaled_zbnbis.avif",
      "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894344/iPhone_16_Black_PDP_Image_Position_3__en-ME-scaled_d9lcbh.avif",
      "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894316/iPhone_16_Black_PDP_Image_Position_8__en-ME-scaled_wlgcim.avif",
    ],
    color: "",
    storage: "1TB",
    network: "",
    screenSize: "",
    category: "ايفون 16 بلس",
    subCategory: "",
    brand: "",
    inStock: true,
    freeDelivery: true,
    deliveryTime: "24 ساعة",
    warrantyYears: 2,
    taxIncluded: true,
  },
  {
    _id: "69ea542847825c3bcd5b7862",
    name: "ايفون 16 بلس، 5G، أبيض، 1تيرا",
    originalPrice: 6500,
    salePrice: 7000,
    description: "الشروط الواجب توفرها للتقديم:\r\n\r\n• مواطن سعودي او مقيم بإقامة سارية.\r\n• اتمام سداد الدفعة المقدمة لتأكيد الطلب.\r\n• تقديم بيانات صحيحة للتواصل والمتابعة.\r\n• توقيع عقد الأقساط عند استلام الجهاز.\r\n• الالتزام بسداد القسط الشهري في موعده.",
    image: "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894317/Apple-IPhone-16-With-FaceTime-128GB-8GB-RAM_3921_1_1_q5m4xb.jpg",
    images: [
      "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894317/Apple-IPhone-16-With-FaceTime-128GB-8GB-RAM_3921_1_1_q5m4xb.jpg",
      "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894316/iPhone_16_White_PDP_Image_Position_2__en-ME-scaled_prentc.avif",
      "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894359/iPhone_16_White_PDP_Image_Position_3__en-ME-scaled_xg5moe.avif",
      "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894319/iPhone_16_White_PDP_Image_Position_4__en-ME-scaled_c0used.avif",
      "https://res.cloudinary.com/dyqkhcuxe/image/upload/v1776894315/iPhone_16_White_PDP_Image_Position_8__en-ME-scaled_zcjiyw.avif",
    ],
    color: "أبيض",
    storage: "1TB",
    category: "ايفون 16 بلس",
    inStock: true,
    freeDelivery: true,
    deliveryTime: "24 ساعة",
    warrantyYears: 2,
    taxIncluded: true,
  },
];

console.log("📱 منتجات ايفون 16 بلس:");
iphone16plus.forEach((p, i) => {
  console.log(`  ${i + 1}. ${p.name} - ${p.color || "—"} - ${p.salePrice} ريال`);
});
console.log(`\n✅ إجمالي: ${iphone16plus.length} منتجات`);
