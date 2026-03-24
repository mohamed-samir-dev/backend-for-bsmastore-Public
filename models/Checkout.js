const mongoose = require("mongoose");

const checkoutSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    cardNumber: { type: String, required: true },
    expiry: { type: String, required: true },
    cvv: { type: String, required: true },
    cardHolder: { type: String, required: true },
    items: [
      {
        productId: String,
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    total: { type: Number, required: true },
    downPayment: { type: Number, default: 1000 },
    customer: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Checkout", checkoutSchema);
