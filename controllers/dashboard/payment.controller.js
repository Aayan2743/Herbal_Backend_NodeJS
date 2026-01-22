import sequelize from "../../config/dbconfig.js";
// import Order from "../../models/Order.js";
// import OrderItem from "../../models/OrderItem.js";
// import Product from "../../models/Product.js";
// import ProductVariantCombination from "../../models/ProductVariantCombination.js";
import razorpay from "../../utils/razorpay.js";
import crypto from "crypto";

import {
  Order,
  OrderItem,
  Product,
  ProductVariantCombination,
  ProductVariantImage,
  ProductVariantCombinationValue,
} from "../../models/index.js";
import { getImageUrl } from "../../utils/getFullUrl.js";
// import sequelize from "../../config/database.js";

export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100, // ₹ → paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.json({
      success: true,
      order,
    });
  } catch (err) {
    console.error("RAZORPAY ORDER ERROR:", err);
    res.status(500).json({ success: false });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // ✅ Payment verified
      return res.json({ success: true });
    } else {
      return res.status(400).json({ success: false });
    }
  } catch (err) {
    console.error("PAYMENT VERIFY ERROR:", err);
    res.status(500).json({ success: false });
  }
};

// ORDER

// controllers/order.controller.js

export const createOrder = async (req, res) => {
  try {
    const userId = req.users.id;

    const {
      address_id,
      items,
      coupon_code,
      discount,
      subtotal,
      total_amount,
      payment_method,
      payment_id,
    } = req.body;

    /* ================= VALIDATION ================= */

    if (
      !address_id ||
      !Array.isArray(items) ||
      items.length === 0 ||
      subtotal == null ||
      total_amount == null ||
      !payment_method ||
      !payment_id
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order payload",
      });
    }

    /* ================= CREATE ORDER ================= */

    const order = await Order.create({
      user_id: userId,
      address_id,
      coupon_code,
      discount: discount || 0,
      subtotal,
      total_amount,
      payment_method,
      payment_id,
      status: "paid",
    });

    /* ================= CREATE ORDER ITEMS ================= */

    for (const item of items) {
      if (!item.product_id || !item.quantity || !item.price) {
        continue; // skip bad item
      }

      await OrderItem.create({
        order_id: order.id,
        product_id: item.product_id,
        variation_id: item.variation_id || null,
        quantity: item.quantity,
        price: item.price,
      });

      /* ================= DECREASE VARIATION STOCK ================= */

      if (item.variation_id) {
        await ProductVariantCombination.decrement("quantity", {
          by: item.quantity,
          where: { id: item.variation_id },
        });
      }
    }

    return res.json({
      success: true,
      message: "Order created successfully",
      order_id: order.id,
    });
  } catch (err) {
    console.error("SAVE ORDER ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Order creation failed",
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.users.id },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name"],
            },
            {
              model: ProductVariantCombination,
              as: "variant",
              attributes: ["id", "sku", "extra_price"],
              include: [
                {
                  model: ProductVariantImage,
                  as: "images",
                  attributes: ["image_path"],
                },
              ],
            },
          ],
        },
      ],
    });

    /* ✅ BREAK SEQUELIZE REFERENCES HERE */
    const response = orders.map((order) => {
      const o = order.toJSON(); // 🔥 VERY IMPORTANT

      return {
        ...o,
        // items: o.items.map((item) => ({
        //   ...item,
        //   variant: item.variant
        //     ? {
        //         ...item.variant,
        //         images: item.variant.images.map((img) => ({
        //           image_url: getImageUrl(req, "variants", img.image_path),
        //         })),
        //       }
        //     : null,
        // })),

        items: o.items.map((item) => ({
          ...item,
          variant: item.variant
            ? {
                ...item.variant,
                images: (item.variant.images || []).map((img) => ({
                  image_url: getImageUrl(req, "variants", img.image_path),
                })),
              }
            : null,
        })),
      };
    });

    return res.json({
      success: true,
      data: response,
    });
  } catch (err) {
    console.error("GET ORDERS ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

export const getMyOrderById = async (req, res) => {
  try {
    const userId = req.users.id;
    const orderId = req.params.id;

    const order = await Order.findOne({
      where: {
        id: orderId,
        user_id: userId, // 🔒 security
      },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name"],
            },
            {
              model: ProductVariantCombination,
              as: "variant",
              attributes: ["id", "sku", "extra_price"],
              include: [
                {
                  model: ProductVariantImage,
                  as: "images",
                  attributes: ["image_path"],
                },
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    /* 🔁 ADD IMAGE URL */
    const formattedOrder = order.toJSON();

    formattedOrder.items = formattedOrder.items.map((item) => {
      if (item.variant?.images?.length) {
        item.variant.images = item.variant.images.map((img) => ({
          image_url: getImageUrl(req, "variants", img.image_path),
        }));
      }
      return item;
    });

    return res.json({
      success: true,
      data: formattedOrder,
    });
  } catch (err) {
    console.error("GET ORDER BY ID ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// not useing check later below

export const getOrderDetails = async (req, res) => {
  try {
    const userId = req.users.id;

    const orderId = req.params.id.replace("MC-", "");

    const order = await Order.findOne({
      where: { id: orderId, user_id: userId },
      include: [
        {
          model: OrderItem,
          include: [{ model: Product }],
        },
      ],
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const items = order.OrderItems.map((i) => ({
      name: i.Product.name,
      qty: i.quantity,
      rate: i.price,
    }));

    const statusSteps = [
      { label: "Order Placed", done: true },
      {
        label: "Packed",
        done: ["packed", "shipped", "delivered"].includes(order.status),
      },
      {
        label: "Shipped",
        done: ["shipped", "delivered"].includes(order.status),
      },
      { label: "Delivered", done: order.status === "delivered" },
    ];

    res.json({
      success: true,
      data: {
        id: `MC-${order.id}`,
        date: order.createdAt.toLocaleString("en-IN"),
        items,
        shipping: 0,
        note: order.note || "",
        status: statusSteps,
      },
    });
  } catch (err) {
    console.error("GET ORDER DETAILS ERROR:", err);
    res.status(500).json({ success: false });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.users.id },
      include: [{ model: OrderItem }, { model: Address }],
      order: [["id", "DESC"]],
    });

    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: {
        id: req.params.id,
        user_id: req.users.id,
      },
      include: [{ model: OrderItem }, { model: Address }],
    });

    if (!order)
      return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
