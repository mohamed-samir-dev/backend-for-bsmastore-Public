const express = require("express");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const Admin = require("../models/Admin");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: "محاولات كثيرة، حاول بعد 15 دقيقة" },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/admin/login
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "البريد والكلمة مطلوبان" });

    const admin = await Admin.findOne({ email });
    if (!admin)
      return res.status(401).json({ error: "بيانات غير صحيحة" });

    if (admin.isLocked())
      return res.status(423).json({ error: "الحساب مقفل مؤقتاً، حاول لاحقاً" });

    const match = await admin.comparePassword(password);
    if (!match) {
      admin.loginAttempts += 1;
      if (admin.loginAttempts >= 5) {
        admin.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        admin.loginAttempts = 0;
      }
      await admin.save();
      return res.status(401).json({ error: "بيانات غير صحيحة" });
    }

    // Reset on success
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res
      .cookie("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 8 * 60 * 60 * 1000,
      })
      .json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// POST /api/admin/logout
router.post("/logout", (req, res) => {
  res.clearCookie("admin_token").json({ success: true });
});

// GET /api/admin/verify
router.get("/verify", (req, res) => {
  const token = req.cookies?.admin_token;
  if (!token) return res.status(401).json({ valid: false });
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true });
  } catch {
    res.status(401).json({ valid: false });
  }
});

module.exports = router;
