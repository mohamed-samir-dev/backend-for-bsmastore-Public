const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  nameAr: { type: String, default: "" },
  nameEn: { type: String, default: "" },
  addressAr: { type: String, default: "" },
  addressEn: { type: String, default: "" },
  phone: { type: String, default: "" },
  whatsapp: { type: String, default: "" },
  website: { type: String, default: "" },
  email: { type: String, default: "" },
  currencyAr: { type: String, default: "" },
  currencyEn: { type: String, default: "" },
  taxNumber: { type: String, default: "" },
  shippingCompany: { type: String, default: "" },
  paymentMethod: { type: String, default: "" },
  details: { type: String, default: "" },
  logo: { type: String, default: "" },
  header: { type: String, default: "" },
  footer: { type: String, default: "" },
  stamp: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Company", companySchema);
