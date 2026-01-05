// controllers/products.controller.js
import Product from "../../models/Product.js";
import fs from "fs";
import Category from "../../models/Category.js";

import Brand from "../../models/Brand.js";
import ProductImage from "../../models/ProductImage.js";
import ProductVariation from "../../models/ProductVariation.js";
import { Op } from "sequelize";
import path from "path";
import { getImageUrl } from "../../utils/getFullUrl.js";
import ProductSeoMeta from "../../models/ProductSeoMeta.js";
import ProductTaxAffinity from "../../models/ProductTaxAffinity.js";
import ProductVideo from "../../models/ProductVideo.js";
import ProductVariationValue from "../../models/ProductVariationValue.js";
import ProductVariantCombinationValue from "../../models/ProductVariantCombinationValue.js";
import ProductVariantCombination from "../../models/ProductVariantCombination.js";
import ProductVariantImage from "../../models/ProductVariantImage.js";

export const createProduct = async (req, res) => {
  try {
    const { name, category_id, brand_id, base_price, discount, description } =
      req.body;

    const product = await Product.create({
      name,
      category_id,
      brand_id,
      base_price,
      discount,
      description,
      status: "draft",
    });

    res.status(201).json({
      status: true,
      message: "Product created",
      data: {
        product_id: product.id,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      category_id,
      brand_id,
      base_price,
      discount,
      description,
      status,
    } = req.body;

    // 1️⃣ Check product exists
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        status: false,
        message: "Product not found",
      });
    }

    // 2️⃣ Update fields
    await product.update({
      name,
      category_id,
      brand_id,
      base_price,
      discount,
      description,
      status, // optional (draft / published)
    });

    // 3️⃣ Success response
    res.status(200).json({
      status: true,
      message: "Product updated successfully",
      data: {
        product_id: product.id,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      error: error.message,
    });
  }
};

export const publishProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({
        status: false,
        message: "Product not found",
      });
    }

    // Optional safety check
    if (product.status === "published") {
      return res.json({
        status: true,
        message: "Product already published",
      });
    }

    // ✅ Publish product
    await product.update({ status: "published" });

    return res.json({
      status: true,
      message: "Product published successfully",
    });
  } catch (error) {
    console.error("PUBLISH PRODUCT ERROR:", error);

    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

export const fetchProducts = async (req, res) => {
  try {
    const { search = "", page = 1, perPage = 10 } = req.query;
    const offset = (page - 1) * perPage;

    const where = {};
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    const { rows, count } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
        {
          model: Brand,
          as: "brand",
          attributes: ["id", "name"],
        },
        {
          model: ProductImage,
          as: "gallery",
          where: { is_primary: true },
          required: false,
          attributes: ["image_path"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: Number(perPage),
      offset: Number(offset),
      distinct: true,
    });

    const data = rows.map((row) => {
      const product = row.toJSON();

      const image = product.gallery?.[0]?.image_path || null;

      return {
        ...product,
        image_url: image
          ? getImageUrl(req, "products", image) // ✅ CORRECT NOW
          : null,
        gallery: undefined,
      };
    });

    return res.json({
      status: true,
      data,
      pagination: {
        total: count,
        page: Number(page),
        perPage: Number(perPage),
        totalPages: Math.ceil(count / perPage),
      },
    });
  } catch (error) {
    console.error("FETCH PRODUCTS ERROR:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch products",
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        { model: ProductImage, as: "gallery" },
        { model: ProductSeoMeta, as: "meta" },
        { model: ProductTaxAffinity, as: "product_tax" },
        { model: ProductVideo, as: "video" },
        {
          model: ProductVariantCombination,
          as: "variantCombinations",
          include: [
            {
              model: ProductVariantCombinationValue,
              as: "combination_values",
              include: [
                {
                  model: ProductVariationValue,
                  as: "value",
                  include: [
                    {
                      model: ProductVariation,
                      as: "variation",
                    },
                  ],
                },
              ],
            },
            {
              model: ProductVariantImage,
              as: "images", // ✅ VARIANT IMAGES
            },
          ],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        status: false,
        message: "Product not found",
      });
    }

    const productJson = product.toJSON();

    /* ===== PRODUCT GALLERY FULL URL ===== */
    if (productJson.gallery?.length) {
      productJson.gallery = productJson.gallery.map((img) => ({
        ...img,
        image_url: getImageUrl(req, "products", img.image_path),
      }));
    }

    /* ===== VARIANT IMAGES FULL URL ===== */
    if (productJson.variantCombinations?.length) {
      productJson.variantCombinations = productJson.variantCombinations.map(
        (variant) => ({
          ...variant,
          images: variant.images?.map((img) => ({
            ...img,
            image_url: getImageUrl(
              req,
              "variants", // uploads/variant-images
              img.image_path
            ),
          })),
        })
      );
    }

    res.json({
      status: true,
      data: productJson,
    });
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

export const updateVariant = async (req, res) => {
  try {
    const { variantId } = req.params;
    const {
      sku,
      extra_price,
      quantity,
      low_quantity,
      keep_image_ids = [],
    } = req.body;

    const variant = await ProductVariantCombination.findByPk(variantId, {
      include: [{ model: ProductVariantImage }],
    });

    if (!variant) {
      return res.status(404).json({
        status: false,
        message: "Variant not found",
      });
    }

    /* ================= UPDATE BASIC FIELDS ================= */
    await variant.update({
      sku,
      extra_price,
      quantity,
      low_quantity,
    });

    /* ================= HANDLE IMAGE DELETE ================= */
    const existingImages = variant.ProductVariantImages || [];

    const imagesToDelete = existingImages.filter(
      (img) => !keep_image_ids.includes(String(img.id))
    );

    for (const img of imagesToDelete) {
      const filePath = path.join(
        process.cwd(),
        "uploads/variants",
        img.image_path
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await img.destroy();
    }

    /* ================= HANDLE NEW IMAGE UPLOAD ================= */
    if (req.files?.length) {
      for (const file of req.files) {
        await ProductVariantImage.create({
          variant_combination_id: variantId,
          image_path: file.filename,
        });
      }
    }

    return res.json({
      status: true,
      message: "Variant updated successfully",
    });
  } catch (err) {
    console.error("UPDATE VARIANT ERROR:", err);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

export const syncVariations = async (req, res) => {
  try {
    const { productId } = req.params;
    const variants = req.body.variants || {};

    console.log("variants", variants);

    // Normalize FormData variants
    const variantList = Array.isArray(variants)
      ? variants
      : Object.values(variants);

    console.log(
      "FILES RECEIVED:",
      req.files?.map((f) => f.fieldname)
    );

    for (let i = 0; i < variantList.length; i++) {
      const v = variantList[i];
      console.log("vvvv", v?.id);

      /* ================= CREATE / UPDATE VARIANT ================= */

      let variant;
      if (v.id) {
        variant = await ProductVariantCombination.findByPk(v.id);
        if (!variant) continue;

        await variant.update({
          sku: v.sku || null,
          extra_price: v.extra_price || 0,
          quantity: v.quantity || 0,
          low_quantity: v.low_quantity || 0,
        });
      } else {
        variant = await ProductVariantCombination.create({
          product_id: productId,
          sku: v.sku || null,
          extra_price: v.extra_price || 0,
          quantity: v.quantity || 0,
          low_quantity: v.low_quantity || 0,
        });
      }

      const variantId = variant.id;

      /* ================= SYNC VARIATION VALUES ================= */

      let valueIds = [];

      if (Array.isArray(v.variation_value_ids)) {
        valueIds = v.variation_value_ids;
      } else if (typeof v.variation_value_ids === "string") {
        try {
          valueIds = JSON.parse(v.variation_value_ids);
        } catch {
          valueIds = [];
        }
      }

      valueIds = valueIds
        .map(Number)
        .filter((id) => Number.isInteger(id) && id > 0);

      await ProductVariantCombinationValue.destroy({
        where: { variant_combination_id: variantId },
      });

      for (const valueId of valueIds) {
        await ProductVariantCombinationValue.create({
          variant_combination_id: variantId,
          variation_value_id: valueId,
        });
      }

      /* ================= SYNC IMAGES ================= */

      const keepIds = v.keep_image_ids
        ? Array.isArray(v.keep_image_ids)
          ? v.keep_image_ids.map(String)
          : [String(v.keep_image_ids)]
        : [];

      const existingImages = await ProductVariantImage.findAll({
        where: { variant_combination_id: variantId },
      });

      // Delete removed images
      for (const img of existingImages) {
        // ONLY delete if keep_image_ids is provided

        console.log("DFsdfsdf", existingImages);
        if (v.keep_image_ids) {
          const keepIds = Array.isArray(v.keep_image_ids)
            ? v.keep_image_ids.map(String)
            : [String(v.keep_image_ids)];

          const existingImages = await ProductVariantImage.findAll({
            where: { variant_combination_id: variantId },
          });

          for (const img of existingImages) {
            if (!keepIds.includes(String(img.id))) {
              const imgPath = path.join(
                process.cwd(),
                "public",
                "uploads",
                "variants",
                img.image_path
              );

              if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
              await img.destroy();
            }
          }
        }

        /* ================= SYNC IMAGES ================= */

        // 🔒 DELETE ONLY IF keep_image_ids IS SENT
        // if (v.keep_image_ids) {
        //   const keepIds = Array.isArray(v.keep_image_ids)
        //     ? v.keep_image_ids.map(String)
        //     : [String(v.keep_image_ids)];

        //   const existingImages = await ProductVariantImage.findAll({
        //     where: { variant_combination_id: variantId },
        //   });

        //   for (const img of existingImages) {
        //     if (!keepIds.includes(String(img.id))) {
        //       const imgPath = path.join(
        //         process.cwd(),
        //         "public",
        //         "uploads",
        //         "variants",
        //         img.image_path
        //       );

        //       console.log("🗑️ Deleting image:", img.image_path);

        //       if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        //       await img.destroy();
        //     }
        //   }
        // }
      }

      // Add new images (🔥 FIXED FIELDNAME)
      console.log("req", req.files);
      const uploadedImages = Array.isArray(req.files)
        ? req.files.filter((f) =>
            f.fieldname.startsWith(`variants[${i}][images]`)
          )
        : [];

      console.log(
        `Variant ${i} (${variantId}) image count:`,
        uploadedImages.length
      );

      // console.log("vvvvvsssss", variantId, file.filename)

      for (const file of uploadedImages) {
        console.log("vvvvvsssss", variantId, file.filename);
        await ProductVariantImage.create({
          variant_combination_id: variantId,
          image_path: file.filename, // store filename only
        });
      }
    }

    return res.json({
      status: true,
      message: "Variants synced successfully",
    });
  } catch (err) {
    console.error("SYNC VARIATIONS ERROR:", err);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

export const updateProductMeta = async (req, res) => {
  try {
    const { productId } = req.params;
    const { meta_title, meta_description, meta_tags } = req.body;

    if (!productId) {
      return res.status(400).json({
        status: false,
        message: "Product ID is required",
      });
    }

    // 🔍 Check if meta already exists
    const existingMeta = await ProductSeoMeta.findOne({
      where: { product_id: productId },
    });

    if (existingMeta) {
      // ✅ UPDATE
      await existingMeta.update({
        meta_title: meta_title || null,
        meta_description: meta_description || null,
        meta_tags: meta_tags || null,
      });
    } else {
      // ✅ CREATE (for safety)
      await ProductSeoMeta.create({
        product_id: productId,
        meta_title: meta_title || null,
        meta_description: meta_description || null,
        meta_tags: meta_tags || null,
      });
    }

    return res.json({
      status: true,
      message: "SEO meta updated successfully",
    });
  } catch (err) {
    console.error("META UPDATE ERROR:", err);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

export const updateProductTax = async (req, res) => {
  try {
    const { productId } = req.params;

    let {
      gst_enabled,
      gst_type,
      gst_percent,
      affinity_enabled,
      affinity_percent,
    } = req.body;

    // 🔥 Normalize booleans → tinyint
    gst_enabled = gst_enabled ? 1 : 0;
    affinity_enabled = affinity_enabled ? 1 : 0;

    // 🔥 Validate gst_type
    if (!["inclusive", "exclusive"].includes(gst_type)) {
      gst_type = "exclusive";
    }

    // 🔥 Reset percent when disabled
    gst_percent = gst_enabled ? Number(gst_percent || 0) : 0;
    affinity_percent = affinity_enabled ? Number(affinity_percent || 0) : 0;

    const [tax] = await ProductTaxAffinity.findOrCreate({
      where: { product_id: productId },
      defaults: {
        gst_enabled: 0,
        gst_type: "exclusive",
        gst_percent: 0,
        affinity_enabled: 0,
        affinity_percent: 0,
      },
    });

    await tax.update({
      gst_enabled,
      gst_type,
      gst_percent,
      affinity_enabled,
      affinity_percent,
    });

    return res.json({
      status: true,
      message: "Tax updated successfully",
    });
  } catch (err) {
    console.error("TAX UPDATE ERROR:", err);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

export const getPOSProducts = async (req, res) => {
  try {
    const { category = "all", brand = "all" } = req.query;

    const where = {};

    if (category !== "all") where.category_id = category;
    if (brand !== "all") where.brand_id = brand;

    const products = await Product.findAll({
      where,
      attributes: ["id", "name", "base_price", "discount"],
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
        {
          model: Brand,
          as: "brand",
          attributes: ["id", "name"],
        },
        {
          model: ProductImage,
          as: "gallery",
          where: { is_primary: true },
          required: false,
          attributes: ["image_path"],
        },
      ],
    });

    const data = products.map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.base_price) - Number(p.discount || 0),
      category: p.category?.id,
      brand: p.brand?.id,
      image: p.gallery?.[0]
        ? `${req.protocol}://${req.get("host")}/uploads/products/${
            p.gallery[0].image_path
          }`
        : null,
    }));

    res.json({ status: true, data });
  } catch (err) {
    console.error("POS PRODUCTS ERROR:", err);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

export const getPOSCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ["id", "name"], // ✅ REMOVE icon
      order: [["name", "ASC"]],
    });

    res.json({
      status: true,
      data: [
        { id: "all", name: "All" }, // frontend handles icon 🌿
        ...categories,
      ],
    });
  } catch (err) {
    console.error("POS CATEGORY ERROR:", err);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

export const getPOSBrands = async (req, res) => {
  const brands = await Brand.findAll({
    attributes: ["slug", "name"],
  });

  res.json({
    status: true,
    data: [
      { id: "all", name: "All" },
      ...brands.map((b) => ({
        id: b.slug,
        name: b.name,
      })),
    ],
  });
};
