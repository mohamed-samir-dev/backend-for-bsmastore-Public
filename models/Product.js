const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    originalPrice: { type: Number, required: true },
    salePrice: { type: Number },
    description: { type: String },
    image: { type: String },
    images: [{ type: String }],
    color: { type: String },
    storage: { type: String },
    network: { type: String },
    screenSize: { type: String },
    specs: {
      screen: String,
      processor: String,
      ram: String,
      storage: String,
      rearCamera: String,
      frontCamera: String,
      battery: String,
      batteryLife: String,
      charging: String,
      os: String,
      extras: String,
    },
    freeDelivery: { type: Boolean, default: true },
    deliveryTime: { type: String, default: "24 ساعة" },
    warrantyYears: { type: Number, default: 2 },
    installment: {
      available: { type: Boolean, default: false },
      downPayment: Number,
      note: String,
      months: Number,
      conditions: [String],
      policy: String,
    },
    taxIncluded: { type: Boolean, default: true },
    category: { type: String },
    subCategory: { type: String },
    brand: { type: String },
    inStock: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual("discountPercent").get(function () {
  if (this.salePrice && this.originalPrice > this.salePrice) {
    return Math.round(((this.originalPrice - this.salePrice) / this.originalPrice) * 100);
  }
  return 0;
});

productSchema.virtual("price").get(function () {
  return this.salePrice || this.originalPrice;
});

module.exports = mongoose.model("Product", productSchema);
