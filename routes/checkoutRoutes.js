const express = require("express");
const router = express.Router();
const Checkout = require("../models/Checkout");

router.post("/", async (req, res) => {
  try {
    const checkout = new Checkout(req.body);
    await checkout.save();
    res.status(201).json({ ok: true, orderId: checkout.orderId });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
