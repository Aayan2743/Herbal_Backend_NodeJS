import {
  PosOrder,
  PosOrderItem,
  Product,
  ProductImage,
  ProductVariantCombination,
  ProductVariantImage,
} from "../../models/index.js";

import { Op } from "sequelize";
import sequelize from "../../config/dbconfig.js";

export const createPOSOrder = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { customer, payment_mode, gst, items, subtotal, discount, total } =
      req.body;

    /* ================= AUTH USER ================= */
    if (!req.users || !req.users.id) {
      throw new Error("Unauthorized: user not found");
    }

    const createdBy = req.users.id;

    /* ================= CREATE ORDER ================= */
    const order = await PosOrder.create(
      {
        order_no: "POS-" + Date.now(),

        customer_name: customer.name,
        customer_phone: customer.phone,

        subtotal,
        gst_enabled: gst.enabled,
        gst_percent: gst.percent,
        gst_amount: gst.amount,

        discount,
        total,

        payment_mode,
        payment_status: "paid",

        created_by: createdBy,
      },
      { transaction: t }
    );

    /* ================= ORDER ITEMS + STOCK UPDATE ================= */
    for (const item of items) {
      /* 🔻 SAVE ORDER ITEM */
      await PosOrderItem.create(
        {
          pos_order_id: order.id,

          product_id: item.product_id,
          variation_id: item.variation_id,

          product_name: item.product_name,
          variation_name: item.variation_name,

          price: item.price,
          qty: item.qty,
          total: item.price * item.qty,
        },
        { transaction: t }
      );

      /* 🔥 STOCK DEDUCTION (LOCKED & SAFE) */
      const variant = await ProductVariantCombination.findOne({
        where: { id: item.variation_id },
        transaction: t,
        lock: t.LOCK.UPDATE, // 🔒 prevents race condition
      });

      if (!variant) {
        throw new Error(`Variant not found (ID: ${item.variation_id})`);
      }

      if (variant.quantity < item.qty) {
        throw new Error(`Insufficient stock for ${item.variation_name}`);
      }

      variant.quantity -= item.qty;
      await variant.save({ transaction: t });
    }

    /* ================= COMMIT ================= */
    await t.commit();

    return res.json({
      status: true,
      message: "POS order created successfully",
      order_id: order.id,
      order_no: order.order_no,
    });
  } catch (err) {
    await t.rollback();

    console.error("POS ORDER ERROR:", err);

    return res.status(500).json({
      status: false,
      message: err.message || "POS order failed",
    });
  }
};

export const getPOSOrderById_working = async (req, res) => {
  try {
    const order = await PosOrder.findByPk(req.params.id, {
      include: [{ model: PosOrderItem, as: "items" }],
    });

    if (!order) {
      return res
        .status(404)
        .json({ status: false, message: "Order not found" });
    }

    return res.json({
      status: true,
      data: {
        order_no: order.order_no,
        customer: {
          name: order.customer_name,
          phone: order.customer_phone,
        },
        gst: {
          enabled: order.gst_enabled,
          percent: order.gst_percent,
          amount: order.gst_amount,
        },
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,
        items: order.items,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false });
  }
};

export const getPOSOrderById = async (req, res) => {
  try {
    const order = await PosOrder.findByPk(req.params.id, {
      include: [
        {
          model: PosOrderItem,
          as: "items",
          include: [
            // ✅ PRODUCT (for product images)
            {
              model: Product,
              as: "product",
              include: [
                {
                  model: ProductImage,
                  as: "gallery",
                  where: { is_primary: true },
                  required: false,
                  attributes: ["image_path", "is_primary"],
                },
              ],
            },

            // ✅ VARIANT (for variant images)
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        status: false,
        message: "Order not found",
      });
    }

    return res.json({
      status: true,
      data: {
        order_no: order.order_no,
        customer: {
          name: order.customer_name,
          phone: order.customer_phone,
        },
        gst: {
          enabled: order.gst_enabled,
          percent: order.gst_percent,
          amount: order.gst_amount,
        },
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,

        items: order.items.map((item) => ({
          id: item.id,
          product_id: item.product_id,
          variation_id: item.variation_id,
          product_name: item.product_name,
          variation_name: item.variation_name,
          price: item.price,
          qty: item.qty,
          total: item.total,

          // 🖼️ PRODUCT IMAGES
          product_images:
            item.product?.gallery?.map((img) => ({
              image_url: `${req.protocol}://${req.get(
                "host"
              )}/uploads/products/${img.image_path}`,
            })) || [],

          // 🖼️ VARIANT IMAGES
        })),
      },
    });
  } catch (err) {
    console.error("GET POS ORDER ERROR:", err);
    return res.status(500).json({ status: false });
  }
};

// controllers/dashboard/pos.controller.js

export const getPOSOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page || 1);
    const perPage = parseInt(req.query.perPage || 3);
    const search = req.query.search || "";

    const offset = (page - 1) * perPage;

    const where = {};

    if (search) {
      where[Op.or] = [
        { order_no: { [Op.like]: `%${search}%` } },
        { customer_name: { [Op.like]: `%${search}%` } },
        { customer_phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows, count } = await PosOrder.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: perPage,
      offset,
    });

    return res.json({
      status: true,
      data: rows,
      pagination: {
        page,
        perPage,
        total: count,
        totalPages: Math.ceil(count / perPage),
      },
    });
  } catch (err) {
    console.error("POS ORDERS PAGINATION ERROR:", err);
    res.status(500).json({
      status: false,
      message: "Failed to fetch orders",
    });
  }
};
