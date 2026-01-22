// import { Product, Wishlist } from "../../models";

import Wishlist from "../../models/Wishlist.js";
import Product from "../../models/Product.js";

export const toggleWishlist = async (req, res) => {
  try {
    const userId = req.users.id;
    const { product_id } = req.body;

    const existing = await Wishlist.findOne({
      where: { user_id: userId, product_id },
    });

    if (existing) {
      await existing.destroy();
      return res.json({
        status: true,
        action: "removed",
      });
    }

    await Wishlist.create({
      user_id: userId,
      product_id,
    });

    return res.json({
      status: true,
      action: "added",
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const userId = req.users.id;

    console.log("user id", userId);

    const items = await Wishlist.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "price", "image", "slug"],
        },
      ],
    });

    return res.json({
      status: true,
      data: items.map((item) => item.Product),
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Failed to fetch wishlist",
    });
  }
};
