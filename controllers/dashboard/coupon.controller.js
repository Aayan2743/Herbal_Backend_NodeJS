import Coupon from "../../models/Coupon.js";

/* ================= CREATE COUPON ================= */
export const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.json({ success: true, data: coupon });
  } catch (err) {
    console.error("CREATE COUPON ERROR:", err);
    res.status(500).json({ success: false, message: "Create failed" });
  }
};

/* ================= GET ALL COUPONS ================= */
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json({ success: true, data: coupons });
  } catch (err) {
    console.error("GET COUPONS ERROR:", err);
    res.status(500).json({ success: false });
  }
};

/* ================= GET SINGLE COUPON ================= */
export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.json({ success: true, data: coupon });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

/* ================= UPDATE COUPON ================= */
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    await coupon.update(req.body);
    res.json({ success: true, data: coupon });
  } catch (err) {
    console.error("UPDATE COUPON ERROR:", err);
    res.status(500).json({ success: false });
  }
};

/* ================= DELETE COUPON ================= */
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    await coupon.destroy();
    res.json({ success: true, message: "Coupon deleted" });
  } catch (err) {
    console.error("DELETE COUPON ERROR:", err);
    res.status(500).json({ success: false });
  }
};

/* ================= APPLY COUPON (FRONTEND) ================= */
export const applyCoupon = async (req, res) => {
  try {
    const { code, amount } = req.body;

    const coupon = await Coupon.findOne({
      where: { code, is_active: true },
    });

    if (!coupon) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid coupon" });
    }

    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon expired" });
    }

    if (amount < coupon.min_order) {
      return res.status(400).json({
        success: false,
        message: `Minimum order ₹${coupon.min_order}`,
      });
    }

    let discount = 0;

    if (coupon.type === "percent") {
      discount = (amount * coupon.value) / 100;
      if (coupon.max_discount) {
        discount = Math.min(discount, coupon.max_discount);
      }
    } else {
      discount = coupon.value;
    }

    res.json({
      success: true,
      discount,
      finalAmount: amount - discount,
    });
  } catch (err) {
    console.error("APPLY COUPON ERROR:", err);
    res.status(500).json({ success: false });
  }
};
