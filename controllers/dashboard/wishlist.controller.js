// import { Product, Wishlist } from "../../models";

import Wishlist from "../../models/Wishlist.js";
import Product from "../../models/Product.js";
import ProductImage from "../../models/ProductImage.js";
import { getImageUrl } from "../../utils/getFullUrl.js";
// import { getImageUrl } from "../utils/urlHelper.js";

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

    const items = await Wishlist.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "base_price", "slug"],
          include: [
            {
              model: ProductImage,
              as: "gallery",
              attributes: ["image_path", "is_primary"],
              order: [["is_primary", "DESC"]],
              limit: 1,
            },
          ],
        },
      ],
    });

    const data = items.map((item) => {
      const product = item.product;
      const imagePath = product.gallery?.[0]?.image_path;

      // image_path = "products/18/img1.webp"
      let image = null;

      if (imagePath) {
        const parts = imagePath.split("/");
        const folder = parts.slice(0, -1).join("/"); // products/18
        const filename = parts.at(-1); // img1.webp

        image = getImageUrl(req, folder, filename);
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
