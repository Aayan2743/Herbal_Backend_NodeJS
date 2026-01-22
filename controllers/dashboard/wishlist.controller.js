// import { Product, Wishlist } from "../../models";

import Wishlist from "../../models/Wishlist.js";
import Product from "../../models/Product.js";
import ProductImage from "../../models/ProductImage.js";
import { getImageUrl } from "../../utils/getFullUrl.js";
import User from "../../models/user.js";
import Order from "../../models/Order.js";
// import { getImageUrl } from "../utils/urlHelper.js";
import { Sequelize } from "sequelize";
export const getWishlist = async (req, res) => {
  try {
    const userId = req.users.id;

    const items = await Wishlist.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          as: "product",
          required: true, // 🔒 auto removes invalid products
          attributes: ["id", "name", "base_price", "slug"],
          include: [
            {
              model: ProductImage,
              as: "gallery",
              attributes: ["image_path", "is_primary"],
              separate: true,
              order: [["is_primary", "DESC"]],
              limit: 1,
            },
          ],
        },
      ],
    });

    const data = items.map(({ product }) => {
      let image = null;
      const imagePath = product.gallery?.[0]?.image_path;

      if (imagePath) {
        const parts = imagePath.split("/");
        image = getImageUrl(req, parts.slice(0, -1).join("/"), parts.at(-1));
      }

      return {
        id: product.id,
        name: product.name,
        price: Number(product.base_price),
        slug: product.slug,
        image,
      };
    });

    return res.json({
      status: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch wishlist",
    });
  }
};

export const toggleWishlist = async (req, res) => {
  try {
    const userId = req.users.id;
    let { product_id } = req.body;

    // 🔒 Normalize product_id
    if (typeof product_id === "object") {
      product_id = product_id.id;
    }

    if (!product_id || isNaN(product_id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid product id",
      });
    }

    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({
        status: false,
        message: "Product not found",
      });
    }

    const existing = await Wishlist.findOne({
      where: { user_id: userId, product_id },
    });

    if (existing) {
      await existing.destroy();
      return res.json({ status: true, action: "removed" });
    }

    await Wishlist.create({ user_id: userId, product_id });
    return res.json({ status: true, action: "added" });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

// import { User, Order, Wishlist } from "../models/index.js";
// import { Sequelize } from "sequelize";

export const dashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalOrders, wishlistItems, activeUsers] =
      await Promise.all([
        User.count({ where: { role: "user" } }),
        Order.count(),
        Wishlist.count(),
        User.count({
          where: { role: "user" },
          include: [
            {
              model: Order,
              as: "orders", // ✅ REQUIRED (alias match)
              required: true, // INNER JOIN = active users
            },
          ],
          distinct: true,
        }),
      ]);

    return res.json({
      status: true,
      data: {
        total_users: totalUsers,
        active_users: activeUsers,
        total_orders: totalOrders,
        wishlist_items: wishlistItems,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Server error",
    });
  }
};

export const getUsersList = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        "id",
        "name",
        "email",
        "phone",
        // "status",
        "created_at",
        [
          Sequelize.literal(`(
            SELECT COUNT(*)
            FROM orders
            WHERE orders.user_id = User.id
          )`),
          "orders_count",
        ],
        [
          Sequelize.literal(`(
            SELECT COUNT(*)
            FROM wishlists
            WHERE wishlists.user_id = User.id
          )`),
          "wishlist_count",
        ],
      ],
      order: [["created_at", "DESC"]],
    });

    return res.json({
      status: true,
      data: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: error.message });
  }
};
