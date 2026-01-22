import express from "express";
// import db from "../config/db.js"; // mysql / pg connection
import tokenAuth from "../middleware/tokenAuth.js";
import CartItem from "../models/CartItem.js";
import {
  createAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
} from "../controllers/dashboard/address.controller.js";
import {
  createOrder,
  createRazorpayOrder,
  getMyOrderById,
  getMyOrders,
  getOrderById,
  getOrderDetails,
  getOrders,
  verifyRazorpayPayment,
} from "../controllers/dashboard/payment.controller.js";
import {
  applyCoupon,
  createCoupon,
  deleteCoupon,
  getCouponById,
  getCoupons,
  updateCoupon,
} from "../controllers/dashboard/coupon.controller.js";
import {
  getWishlist,
  toggleWishlist,
} from "../controllers/dashboard/wishlist.controller.js";

export const cartrouter = express.Router();

cartrouter.post("/sync", tokenAuth, async (req, res) => {
  try {
    const userId = req.users.id;
    const cart = req.body.cart || [];

    /* ================= EMPTY CART = DELETE ALL ================= */
    if (cart.length === 0) {
      await CartItem.destroy({
        where: { user_id: userId },
      });

      return res.json({
        success: true,
        message: "Cart cleared",
      });
    }

    /* ================= GET DB CART ================= */
    const dbItems = await CartItem.findAll({
      where: { user_id: userId },
    });

    const cartKeys = cart.map((item) => `${item.id}_${item.variationId || 0}`);

    /* ================= DELETE REMOVED ITEMS ================= */
    for (const dbItem of dbItems) {
      const dbKey = `${dbItem.product_id}_${dbItem.variation_id || 0}`;
      if (!cartKeys.includes(dbKey)) {
        await dbItem.destroy();
      }
    }

    /* ================= UPSERT ITEMS ================= */
    for (const item of cart) {
      const [row, created] = await CartItem.findOrCreate({
        where: {
          user_id: userId,
          product_id: item.id,
          variation_id: item.variationId || null,
        },
        defaults: {
          price: item.price,
          quantity: item.quantity,
        },
      });

      if (!created) {
        await row.update({
          price: item.price,
          quantity: item.quantity,
        });
      }
    }

    return res.json({
      success: true,
      message: "Cart synced successfully",
    });
  } catch (err) {
    console.error("CART SYNC ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Cart sync failed",
    });
  }
});

cartrouter.post("/add-address", tokenAuth, createAddress); // CREATE
cartrouter.get("/get-address", tokenAuth, getAddresses); // READ
cartrouter.put("/update-address/:id", tokenAuth, updateAddress); // UPDATE
cartrouter.delete("/delete-address/:id", tokenAuth, deleteAddress); // DELETE

cartrouter.post("/create-order", tokenAuth, createRazorpayOrder);
cartrouter.post("/verify-payment", tokenAuth, verifyRazorpayPayment);

cartrouter.post("/apply-coupon", tokenAuth, applyCoupon);
cartrouter.post("/create-coupon", tokenAuth, createCoupon);
cartrouter.get("/list-coupon", tokenAuth, getCoupons);
cartrouter.get("/get-coupon/:id", tokenAuth, getCouponById);
cartrouter.put("/update-coupon/:id", tokenAuth, updateCoupon);
cartrouter.delete("/delete-coupon/:id", tokenAuth, deleteCoupon);

// ORDER

cartrouter.post("/save-order", tokenAuth, createOrder);
cartrouter.get("/get-my-orders", tokenAuth, getMyOrders);
cartrouter.get("/get-my-orders/:id", tokenAuth, getMyOrderById);

// cartrouter.get("/:id", tokenAuth, getMyOrderById);

cartrouter.get("/get-wishlist", tokenAuth, getWishlist);
cartrouter.post("/wishlist-toggle", tokenAuth, toggleWishlist);

// cartrouter.get("/get-orders", tokenAuth, getOrderDetails);
// cartrouter.get("/get-order", tokenAuth, getOrders);
// cartrouter.get("/get-order/:id", tokenAuth, getOrderById);
// cartrouter.put("/:id", tokenAuth, updateOrder); // admin
// cartrouter.delete("/:id", tokenAuth, deleteOrder); // admin
