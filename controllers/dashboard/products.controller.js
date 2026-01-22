// controllers/products.controller.js
import Product from "../../models/Product.js";
import fs from "fs";
import Category from "../../models/Category.js";

import { Op, Sequelize } from "sequelize";

import Brand from "../../models/Brand.js";
import ProductImage from "../../models/ProductImage.js";
import ProductVariation from "../../models/ProductVariation.js";

import path from "path";
import { getImageUrl } from "../../utils/getFullUrl.js";
import ProductSeoMeta from "../../models/ProductSeoMeta.js";
import ProductTaxAffinity from "../../models/ProductTaxAffinity.js";
import ProductVideo from "../../models/ProductVideo.js";
import ProductVariationValue from "../../models/ProductVariationValue.js";
import ProductVariantCombinationValue from "../../models/ProductVariantCombinationValue.js";
import ProductVariantCombination from "../../models/ProductVariantCombination.js";
import ProductVariantImage from "../../models/ProductVariantImage.js";

export const createProduct_old = async (req, res) => {
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

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const createProduct = async (req, res) => {
  try {
    const { name, category_id, brand_id, base_price, discount, description } =
      req.body;

    /* 🔹 Generate base slug */
    let baseSlug = slugify(name);
    let slug = baseSlug;
    let count = 1;
    console.log("ssss", baseSlug);
    /* 🔹 Ensure UNIQUE slug */
    while (await Product.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    /* 🔹 Create product */
    const product = await Product.create({
      name,
      slug, // ✅ saved here
      category_id,
      brand_id,
      base_price,
      discount,
      description,
      status: "draft",
    });

    return res.status(201).json({
      status: true,
      message: "Product created",
      data: {
        product_id: product.id,
        slug: product.slug, // ✅ return slug
      },
    });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
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

    /* 1️⃣ Check product exists */
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        status: false,
        message: "Product not found",
      });
    }

    let updatedSlug = product.slug;

    /* 2️⃣ Update slug ONLY if name changed */
    if (name && name !== product.name) {
      let baseSlug = slugify(name);
      let slug = baseSlug;
      let count = 1;

      while (
        await Product.findOne({
          where: {
            slug,
            id: { [Op.ne]: product.id },
          },
        })
      ) {
        slug = `${baseSlug}-${count++}`;
      }

      updatedSlug = slug;
    }

    /* 3️⃣ Update product */
    await product.update({
      name,
      slug: updatedSlug,
      category_id,
      brand_id,
      base_price,
      discount,
      description,
      status,
    });

    /* 4️⃣ Response */
    return res.status(200).json({
      status: true,
      message: "Product updated successfully",
      data: {
        product_id: product.id,
        slug: updatedSlug,
      },
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        status: false,
        message: "Product slug is required",
      });
    }

    /* ================= FETCH PRODUCT ================= */
    const product = await Product.findOne({
      where: {
        slug,
        status: "published",
      },
      attributes: [
        "id",
        "name",
        "slug",
        "base_price",
        "discount",
        "description",
      ],
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "slug"],
        },
        {
          model: Brand,
          as: "brand",
          attributes: ["id", "name"],
        },

        /* PRODUCT IMAGES */
        {
          model: ProductImage,
          as: "gallery",
          required: false,
          attributes: ["image_path", "is_primary"],
        },

        /* PRODUCT VIDEO */
        {
          model: ProductVideo,
          as: "video",
          required: false,
          attributes: ["video_url"],
        },

        /* TAX */
        {
          model: ProductTaxAffinity,
          as: "product_tax",
          required: false,
          attributes: ["gst_enabled", "gst_type", "gst_percent"],
        },

        /* VARIANTS */
        {
          model: ProductVariantCombination,
          as: "variantCombinations",
          required: true,
          attributes: ["id", "sku", "extra_price", "quantity"],
          include: [
            {
              model: ProductVariantCombinationValue,
              as: "combination_values",
              include: [
                {
                  model: ProductVariationValue,
                  as: "value",
                  attributes: ["value"],
                },
              ],
            },
            {
              model: ProductVariantImage,
              as: "images",
              required: false,
              attributes: ["image_path"],
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

    /* ================= PRICE ================= */
    const basePrice =
      Number(product.base_price) - Number(product.discount || 0);
    const tax = product.product_tax?.[0] || null;
    const finalBasePrice = applyTax(basePrice, tax);

    /* ================= IMAGES ================= */
    const images =
      product.gallery?.map((img) => ({
        image_url: `${req.protocol}://${req.get("host")}/uploads/products/${
          img.image_path
        }`,
        is_primary: img.is_primary,
      })) || [];

    /* ================= VARIATIONS ================= */
    const variations = product.variantCombinations
      .filter((vc) => vc.quantity > 0)
      .map((vc) => {
        const variantPrice = applyTax(
          basePrice + Number(vc.extra_price || 0),
          tax
        );

        return {
          id: vc.id,
          sku: vc.sku,
          name: vc.combination_values?.map((cv) => cv.value?.value).join(" / "),
          price: Number(variantPrice.toFixed(2)),
          stock: vc.quantity,
          images:
            vc.images?.map((img) => ({
              image_url: `${req.protocol}://${req.get(
                "host"
              )}/uploads/variants/${img.image_path}`,
            })) || [],
        };
      });

    /* ================= RESPONSE ================= */
    return res.json({
      status: true,
      data: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: Number(finalBasePrice.toFixed(2)),
        image:
          images.find((i) => i.is_primary)?.image_url ||
          images[0]?.image_url ||
          null,
        images,
        variations,
        category: product.category
          ? {
              id: product.category.id,
              name: product.category.name,
              slug: product.category.slug,
            }
          : null,
        brand: product.brand
          ? {
              id: product.brand.id,
              name: product.brand.name,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("GET PRODUCT BY SLUG ERROR:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
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

        {
          model: ProductSeoMeta,
          as: "meta",
          required: false,
          attributes: ["meta_title", "meta_description", "meta_tags"],
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

export const fetchProducts_sssss_no_proze = async (req, res) => {
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

        /* ✅ SEO META */
        {
          model: ProductSeoMeta,
          as: "meta",
          required: false,
          attributes: ["meta_title", "meta_description", "meta_tags"],
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
        id: product.id,
        name: product.name,
        slug: product.slug,

        category: product.category,
        brand: product.brand,

        image_url: image ? getImageUrl(req, "products", image) : null,

        /* ✅ SEO META */
        seo: product.meta
          ? {
              title: product.meta.meta_title,
              description: product.meta.meta_description,
              keywords: product.meta.meta_tags,
            }
          : null,
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

export const fetchProducts_sss = async (req, res) => {
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

        /* ✅ SEO META */
        {
          model: ProductSeoMeta,
          as: "meta",
          required: false,
          attributes: ["meta_title", "meta_description", "meta_tags"],
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
        id: product.id,
        name: product.name,
        slug: product.slug,

        // ✅ PRICE (THIS FIXES ₹0 ISSUE)
        price: Number(product.price),
        sale_price: product.sale_price ? Number(product.sale_price) : null,
        mrp: product.mrp ? Number(product.mrp) : Number(product.price),

        category: product.category,
        brand: product.brand,

        image_url: image ? getImageUrl(req, "products", image) : null,

        /* ✅ SEO META */
        seo: product.meta
          ? {
              title: product.meta.meta_title,
              description: product.meta.meta_description,
              keywords: product.meta.meta_tags,
            }
          : null,
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

// export const syncVariations = async (req, res) => {
//   try {
//     const { productId } = req.params;
//     const variants = req.body.variants || {};

//     console.log("variants", variants);

//     // Normalize FormData variants
//     const variantList = Array.isArray(variants)
//       ? variants
//       : Object.values(variants);

//     console.log(
//       "FILES RECEIVED:",
//       req.files?.map((f) => f.fieldname)
//     );

//     for (let i = 0; i < variantList.length; i++) {
//       const v = variantList[i];
//       console.log("vvvv", v?.id);

//       /* ================= CREATE / UPDATE VARIANT ================= */

//       let variant;
//       if (v.id) {
//         variant = await ProductVariantCombination.findByPk(v.id);
//         if (!variant) continue;

//         await variant.update({
//           sku: v.sku || null,
//           extra_price: v.extra_price || 0,
//           quantity: v.quantity || 0,
//           low_quantity: v.low_quantity || 0,
//         });
//       } else {
//         variant = await ProductVariantCombination.create({
//           product_id: productId,
//           sku: v.sku || null,
//           extra_price: v.extra_price || 0,
//           quantity: v.quantity || 0,
//           low_quantity: v.low_quantity || 0,
//         });
//       }

//       const variantId = variant.id;

//       /* ================= SYNC VARIATION VALUES ================= */

//       let valueIds = [];

//       if (Array.isArray(v.variation_value_ids)) {
//         valueIds = v.variation_value_ids;
//       } else if (typeof v.variation_value_ids === "string") {
//         try {
//           valueIds = JSON.parse(v.variation_value_ids);
//         } catch {
//           valueIds = [];
//         }
//       }

//       valueIds = valueIds
//         .map(Number)
//         .filter((id) => Number.isInteger(id) && id > 0);

//       await ProductVariantCombinationValue.destroy({
//         where: { variant_combination_id: variantId },
//       });

//       for (const valueId of valueIds) {
//         await ProductVariantCombinationValue.create({
//           variant_combination_id: variantId,
//           variation_value_id: valueId,
//         });
//       }

//       /* ================= SYNC IMAGES ================= */

//       const keepIds = v.keep_image_ids
//         ? Array.isArray(v.keep_image_ids)
//           ? v.keep_image_ids.map(String)
//           : [String(v.keep_image_ids)]
//         : [];

//       const existingImages = await ProductVariantImage.findAll({
//         where: { variant_combination_id: variantId },
//       });

//       // Delete removed images
//       for (const img of existingImages) {
//         // ONLY delete if keep_image_ids is provided

//         console.log("DFsdfsdf", existingImages);
//         if (v.keep_image_ids) {
//           const keepIds = Array.isArray(v.keep_image_ids)
//             ? v.keep_image_ids.map(String)
//             : [String(v.keep_image_ids)];

//           const existingImages = await ProductVariantImage.findAll({
//             where: { variant_combination_id: variantId },
//           });

//           for (const img of existingImages) {
//             if (!keepIds.includes(String(img.id))) {
//               const imgPath = path.join(
//                 process.cwd(),
//                 "public",
//                 "uploads",
//                 "variants",
//                 img.image_path
//               );

//               if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
//               await img.destroy();
//             }
//           }
//         }

//         /* ================= SYNC IMAGES ================= */

//         // 🔒 DELETE ONLY IF keep_image_ids IS SENT
//         // if (v.keep_image_ids) {
//         //   const keepIds = Array.isArray(v.keep_image_ids)
//         //     ? v.keep_image_ids.map(String)
//         //     : [String(v.keep_image_ids)];

//         //   const existingImages = await ProductVariantImage.findAll({
//         //     where: { variant_combination_id: variantId },
//         //   });

//         //   for (const img of existingImages) {
//         //     if (!keepIds.includes(String(img.id))) {
//         //       const imgPath = path.join(
//         //         process.cwd(),
//         //         "public",
//         //         "uploads",
//         //         "variants",
//         //         img.image_path
//         //       );

//         //       console.log("🗑️ Deleting image:", img.image_path);

//         //       if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
//         //       await img.destroy();
//         //     }
//         //   }
//         // }
//       }

//       // Add new images (🔥 FIXED FIELDNAME)
//       console.log("req", req.files);
//       const uploadedImages = Array.isArray(req.files)
//         ? req.files.filter((f) =>
//             f.fieldname.startsWith(`variants[${i}][images]`)
//           )
//         : [];

//       console.log(
//         `Variant ${i} (${variantId}) image count:`,
//         uploadedImages.length
//       );

//       // console.log("vvvvvsssss", variantId, file.filename)

//       for (const file of uploadedImages) {
//         console.log("vvvvvsssss", variantId, file.filename);
//         await ProductVariantImage.create({
//           variant_combination_id: variantId,
//           image_path: file.filename, // store filename only
//         });
//       }
//     }

//     return res.json({
//       status: true,
//       message: "Variants synced successfully",
//     });
//   } catch (err) {
//     console.error("SYNC VARIATIONS ERROR:", err);
//     return res.status(500).json({
//       status: false,
//       message: "Server error",
//     });
//   }
// };

export const syncVariations = async (req, res) => {
  try {
    const { productId } = req.params;
    const variants = req.body.variants || {};

    const variantList = Array.isArray(variants)
      ? variants
      : Object.values(variants);

    for (let i = 0; i < variantList.length; i++) {
      const v = variantList[i];

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
      if (typeof v.variation_value_ids === "string") {
        try {
          valueIds = JSON.parse(v.variation_value_ids);
        } catch {
          valueIds = [];
        }
      } else if (Array.isArray(v.variation_value_ids)) {
        valueIds = v.variation_value_ids;
      }

      valueIds = valueIds.map(Number).filter(Boolean);

      await ProductVariantCombinationValue.destroy({
        where: { variant_combination_id: variantId },
      });

      for (const valueId of valueIds) {
        await ProductVariantCombinationValue.create({
          variant_combination_id: variantId,
          variation_value_id: valueId,
        });
      }

      /* ================= IMAGE DELETE LOGIC (FIXED) ================= */

      let keepIds = null;

      if ("keep_image_ids" in v) {
        if (Array.isArray(v.keep_image_ids)) {
          keepIds = v.keep_image_ids
            .map(String)
            .filter((id) => id && id !== "undefined" && id !== "null");
        } else if (v.keep_image_ids === "") {
          keepIds = []; // 🔥 delete all
        } else {
          keepIds = [String(v.keep_image_ids)];
        }
      }

      if (keepIds !== null) {
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

      /* ================= ADD NEW IMAGES ================= */

      const uploadedImages = Array.isArray(req.files)
        ? req.files.filter((f) =>
            f.fieldname.startsWith(`variants[${i}][images]`)
          )
        : [];

      for (const file of uploadedImages) {
        await ProductVariantImage.create({
          variant_combination_id: variantId,
          image_path: file.filename,
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

    const {
      gst_enabled,
      gst_type,
      gst_percent,
      affinity_enabled,
      affinity_percent,
      status, // 👈 publish / draft
    } = req.body;

    /* ================= UPDATE PRODUCT STATUS ================= */
    await Product.update(
      { status }, // "draft" | "published"
      { where: { id: productId } }
    );

    /* ================= UPDATE / CREATE TAX ================= */
    const [tax, created] = await ProductTaxAffinity.findOrCreate({
      where: { product_id: productId },
      defaults: {
        gst_enabled,
        gst_type,
        gst_percent,
        affinity_enabled,
        affinity_percent,
      },
    });

    if (!created) {
      await tax.update({
        gst_enabled,
        gst_type,
        gst_percent,
        affinity_enabled,
        affinity_percent,
      });
    }

    return res.json({
      status: true,
      message: "Product tax & status updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: "Failed to update product tax",
    });
  }
};

const applyTax = (price, tax) => {
  if (!tax?.gst_enabled) return price;

  const percent = Number(tax.gst_percent || 0);

  // ✅ YOUR FORMULA
  if (tax.gst_type === "exclusive") {
    return price * (1 + percent / 100);
  }

  // inclusive → price already includes tax
  return price;
};

export const getPOSProducts = async (req, res) => {
  try {
    const { category = "all", brand = "all" } = req.query;

    /* ================= FILTER ================= */
    const where = { status: "published" };
    if (category !== "all") where.category_id = category;
    if (brand !== "all") where.brand_id = brand;

    /* ================= FETCH ================= */
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

        /* ✅ ALL PRODUCT IMAGES */
        {
          model: ProductImage,
          as: "gallery",
          required: false,
          attributes: ["image_path", "is_primary"],
        },

        /* ✅ PRODUCT VIDEO */
        {
          model: ProductVideo,
          as: "video",
          required: false,
          attributes: ["video_url"],
        },

        /* ================= TAX ================= */
        {
          model: ProductTaxAffinity,
          as: "product_tax",
          required: false,
          attributes: ["gst_enabled", "gst_type", "gst_percent"],
        },

        /* ================= VARIANTS ================= */
        {
          model: ProductVariantCombination,
          as: "variantCombinations",
          required: true,
          attributes: ["id", "sku", "extra_price", "quantity"],
          include: [
            {
              model: ProductVariantCombinationValue,
              as: "combination_values",
              attributes: ["variation_value_id"],
              include: [
                {
                  model: ProductVariationValue,
                  as: "value",
                  attributes: ["id", "value"],
                },
              ],
            },

            /* ✅ ALL VARIANT IMAGES */
            {
              model: ProductVariantImage,
              as: "images",
              required: false,
              attributes: ["image_path"],
            },
          ],
        },
      ],
    });

    /* ================= FORMAT FOR POS ================= */
    const data = products
      .map((p) => {
        const basePrice = Number(p.base_price) - Number(p.discount || 0);

        const tax = p.product_tax?.[0] || null;
        const finalBasePrice = applyTax(basePrice, tax);

        /* ===== PRODUCT MEDIA ===== */
        const productImages =
          p.gallery?.map((img) => ({
            image_url: `${req.protocol}://${req.get("host")}/uploads/products/${
              img.image_path
            }`,
            is_primary: img.is_primary,
          })) || [];

        const productVideo = p.video
          ? {
              video_url: p.video.video_url,
            }
          : null;

        /* ===== VARIATIONS ===== */
        const variationsMap = new Map();

        p.variantCombinations.forEach((vc) => {
          if (vc.quantity <= 0) return;

          const variantBase = basePrice + Number(vc.extra_price || 0);

          const finalVariantPrice = applyTax(variantBase, tax);

          variationsMap.set(vc.id, {
            id: vc.id,
            sku: vc.sku,
            name: vc.combination_values
              ?.map((cv) => cv.value?.value)
              .join(" / "),
            price: Number(finalVariantPrice.toFixed(2)),
            stock: vc.quantity,

            /* ✅ VARIANT MEDIA */
            images:
              vc.images?.map((img) => ({
                image_url: `${req.protocol}://${req.get(
                  "host"
                )}/uploads/variants/${img.image_path}`,
              })) || [],
          });
        });

        if (variationsMap.size === 0) return null;

        return {
          id: p.id,
          name: p.name,
          price: Number(finalBasePrice.toFixed(2)),
          gst: tax
            ? {
                enabled: tax.gst_enabled,
                type: tax.gst_type,
                percent: Number(tax.gst_percent),
              }
            : null,

          /* ✅ ALL PRODUCT MEDIA */
          images: productImages,
          video: productVideo,

          /* convenience thumbnail */
          image:
            productImages.find((i) => i.is_primary)?.image_url ||
            productImages[0]?.image_url ||
            null,

          variations: Array.from(variationsMap.values()),
          category: p.category?.id,
          brand: p.brand?.id,
        };
      })
      .filter(Boolean);

    return res.json({ status: true, data });
  } catch (err) {
    console.error("POS PRODUCTS ERROR:", err);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

export const getEcomProducts = async (req, res) => {
  try {
    const { category = "all", brand = "all" } = req.query;

    /* ================= BASE FILTER ================= */
    const where = { status: "published" };

    if (category !== "all") where.category_id = category;
    if (brand !== "all") where.brand_id = brand;

    /* ================= FETCH PRODUCTS ================= */
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

        /* ===== PRODUCT IMAGES ===== */
        {
          model: ProductImage,
          as: "gallery",
          required: false,
          attributes: ["image_path", "is_primary"],
        },

        /* ===== PRODUCT VIDEO ===== */
        {
          model: ProductVideo,
          as: "video",
          required: false,
          attributes: ["video_url"],
        },

        /* ===== TAX ===== */
        {
          model: ProductTaxAffinity,
          as: "product_tax",
          required: false,
          attributes: ["gst_enabled", "gst_type", "gst_percent"],
        },

        /* ===== VARIANTS ===== */
        {
          model: ProductVariantCombination,
          as: "variantCombinations",
          required: true,
          attributes: ["id", "sku", "extra_price", "quantity"],
          include: [
            {
              model: ProductVariantCombinationValue,
              as: "combination_values",
              attributes: ["variation_value_id"],
              include: [
                {
                  model: ProductVariationValue,
                  as: "value",
                  attributes: ["id", "value"],
                },
              ],
            },
            {
              model: ProductVariantImage,
              as: "images",
              required: false,
              attributes: ["image_path"],
            },
          ],
        },
      ],
    });

    /* ================= FORMAT RESPONSE ================= */
    const data = products
      .map((p) => {
        const basePrice = Number(p.base_price) - Number(p.discount || 0);

        const tax = p.product_tax?.[0] || null;

        /* ===== PRODUCT IMAGES ===== */
        const productImages =
          p.gallery?.map((img) => ({
            image_url: `${req.protocol}://${req.get("host")}/uploads/products/${
              img.image_path
            }`,
            is_primary: img.is_primary,
          })) || [];

        /* ===== VARIATIONS ===== */
        const variationsMap = new Map();
        let minVariationPrice = null;

        p.variantCombinations.forEach((vc) => {
          if (vc.quantity <= 0) return;

          const variantBase = basePrice + Number(vc.extra_price || 0);

          const finalVariantPrice = applyTax(variantBase, tax);
          const priceNumber = Number(finalVariantPrice.toFixed(2));

          /* ✅ FIND LOWEST VARIATION PRICE */
          if (minVariationPrice === null || priceNumber < minVariationPrice) {
            minVariationPrice = priceNumber;
          }

          variationsMap.set(vc.id, {
            id: vc.id,
            sku: vc.sku,
            name: vc.combination_values
              ?.map((cv) => cv.value?.value)
              .join(" / "),
            price: priceNumber,
            stock: vc.quantity,
            images:
              vc.images?.map((img) => ({
                image_url: `${req.protocol}://${req.get(
                  "host"
                )}/uploads/variants/${img.image_path}`,
              })) || [],
          });
        });

        if (!variationsMap.size || minVariationPrice === null) {
          return null;
        }

        /* ===== FINAL PRODUCT OBJECT ===== */
        return {
          id: p.id,
          name: p.name,

          /* ✅ LOWEST VARIATION PRICE */
          price: minVariationPrice,

          gst: tax
            ? {
                enabled: tax.gst_enabled,
                type: tax.gst_type,
                percent: Number(tax.gst_percent),
              }
            : null,

          images: productImages,
          video: p.video ? { video_url: p.video.video_url } : null,

          image:
            productImages.find((i) => i.is_primary)?.image_url ||
            productImages[0]?.image_url ||
            null,

          variations: Array.from(variationsMap.values()),
          category: p.category?.id,
          brand: p.brand?.id,
        };
      })
      .filter(Boolean);

    return res.json({ status: true, data });
  } catch (err) {
    console.error("POS PRODUCTS ERROR:", err);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

export const getProductsAll_working = async (req, res) => {
  try {
    const {
      category = "all",
      brands,
      price_min,
      price_max,
      sortBy,
      q,
    } = req.query;

    /* ================= BASE WHERE ================= */
    const where = { status: "published" };

    /* ================= CATEGORY (SLUG → ID) ================= */
    if (category !== "all") {
      const categoryRow = await Category.findOne({
        where: { slug: category },
        attributes: ["id"],
      });

      if (!categoryRow) {
        return res.json({ status: true, data: [] });
      }

      where.category_id = categoryRow.id;
    }

    /* ================= BRAND (MULTI) ================= */
    if (brands?.length) {
      where.brand_id = {
        [Op.in]: Array.isArray(brands) ? brands : [brands],
      };
    }

    /* ================= SEARCH ================= */
    if (q) {
      where.name = {
        [Op.like]: `%${q}%`,
      };
    }

    /* ================= FETCH ================= */
    const products = await Product.findAll({
      where,
      attributes: ["id", "name", "base_price", "discount", "slug"],
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
          required: false,
          attributes: ["image_path", "is_primary"],
        },
        {
          model: ProductVideo,
          as: "video",
          required: false,
          attributes: ["video_url"],
        },
        {
          model: ProductTaxAffinity,
          as: "product_tax",
          required: false,
          attributes: ["gst_enabled", "gst_type", "gst_percent"],
        },
        {
          model: ProductVariantCombination,
          as: "variantCombinations",
          required: true,
          attributes: ["id", "sku", "extra_price", "quantity"],
          include: [
            {
              model: ProductVariantCombinationValue,
              as: "combination_values",
              include: [
                {
                  model: ProductVariationValue,
                  as: "value",
                  attributes: ["value"],
                },
              ],
            },
            {
              model: ProductVariantImage,
              as: "images",
              required: false,
              attributes: ["image_path"],
            },
          ],
        },

        {
          model: ProductSeoMeta,
          as: "meta",
          required: false,
          attributes: ["meta_title", "meta_description", "meta_keywords"],
        },
      ],
    });

    /* ================= FORMAT RESPONSE ================= */
    let data = products
      .map((p) => {
        const basePrice = Number(p.base_price) - Number(p.discount || 0);

        const tax = p.product_tax?.[0] || null;

        /* ===== PRODUCT IMAGES ===== */
        const productImages =
          p.gallery?.map((img) => ({
            image_url: `${req.protocol}://${req.get("host")}/uploads/products/${
              img.image_path
            }`,
            is_primary: img.is_primary,
          })) || [];

        /* ===== VARIATIONS & LOWEST PRICE ===== */
        let minPrice = null;

        const variations = p.variantCombinations
          .filter((vc) => vc.quantity > 0)
          .map((vc) => {
            const variantBase = basePrice + Number(vc.extra_price || 0);

            const finalPrice = applyTax(variantBase, tax);
            const priceNumber = Number(finalPrice.toFixed(2));

            if (minPrice === null || priceNumber < minPrice) {
              minPrice = priceNumber;
            }

            return {
              id: vc.id,
              sku: vc.sku,
              name: vc.combination_values
                ?.map((cv) => cv.value?.value)
                .join(" / "),
              price: priceNumber,
              stock: vc.quantity,
              images:
                vc.images?.map((img) => ({
                  image_url: `${req.protocol}://${req.get(
                    "host"
                  )}/uploads/variants/${img.image_path}`,
                })) || [],
            };
          });

        if (!variations.length || minPrice === null) return null;

        return {
          id: p.id,
          name: p.name,
          slug: p.slug,

          /* ✅ LOWEST VARIATION PRICE */
          price: minPrice,

          images: productImages,
          image:
            productImages.find((i) => i.is_primary)?.image_url ||
            productImages[0]?.image_url ||
            null,

          variations,
          category: p.category?.id,
          brand: p.brand?.id,
        };
      })
      .filter(Boolean);

    /* ================= PRICE FILTER (ON FINAL PRICE) ================= */
    if (price_min || price_max) {
      const min = Number(price_min ?? 0);
      const max = Number(price_max ?? Infinity);

      data = data.filter((p) => p.price >= min && p.price <= max);
    }

    /* ================= SORT ================= */
    if (sortBy === "price_low_high") {
      data.sort((a, b) => a.price - b.price);
    }

    if (sortBy === "price_high_low") {
      data.sort((a, b) => b.price - a.price);
    }

    return res.json({ status: true, data });
  } catch (err) {
    console.error("PRODUCT FILTER ERROR:", err);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

export const getProductsAll = async (req, res) => {
  try {
    const {
      category = "all",
      brands,
      price_min,
      price_max,
      sortBy,
      q,
    } = req.query;

    /* ================= BASE WHERE ================= */
    const where = { status: "published" };

    /* ================= CATEGORY ================= */
    if (category !== "all") {
      const categoryRow = await Category.findOne({
        where: { slug: category },
        attributes: ["id"],
      });

      if (!categoryRow) {
        return res.json({ status: true, data: [] });
      }

      where.category_id = categoryRow.id;
    }

    /* ================= BRAND FILTER ================= */
    if (brands?.length) {
      where.brand_id = {
        [Op.in]: Array.isArray(brands) ? brands : [brands],
      };
    }

    /* ================= SEARCH ================= */
    if (q) {
      where.name = {
        [Op.like]: `%${q}%`,
      };
    }

    /* ================= FETCH PRODUCTS ================= */
    const products = await Product.findAll({
      where,
      attributes: ["id", "name", "slug", "base_price", "discount"],

      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "slug"],
        },
        {
          model: Brand,
          as: "brand",
          attributes: ["id", "name"],
        },

        /* ✅ SEO META */
        {
          model: ProductSeoMeta,
          as: "meta",
          required: false,
          attributes: ["meta_title", "meta_description", "meta_tags"],
        },

        {
          model: ProductImage,
          as: "gallery",
          required: false,
          attributes: ["image_path", "is_primary"],
        },
        {
          model: ProductVideo,
          as: "video",
          required: false,
          attributes: ["video_url"],
        },
        {
          model: ProductTaxAffinity,
          as: "product_tax",
          required: false,
          attributes: ["gst_enabled", "gst_type", "gst_percent"],
        },
        {
          model: ProductVariantCombination,
          as: "variantCombinations",
          required: true,
          attributes: ["id", "sku", "extra_price", "quantity"],
          include: [
            {
              model: ProductVariantCombinationValue,
              as: "combination_values",
              include: [
                {
                  model: ProductVariationValue,
                  as: "value",
                  attributes: ["value"],
                },
              ],
            },
            {
              model: ProductVariantImage,
              as: "images",
              required: false,
              attributes: ["image_path"],
            },
          ],
        },
      ],
    });

    /* ================= FORMAT RESPONSE ================= */
    let data = products
      .map((p) => {
        const basePrice = Number(p.base_price) - Number(p.discount || 0);
        const tax = p.product_tax?.[0] || null;

        /* ===== IMAGES ===== */
        const images =
          p.gallery?.map((img) => ({
            image_url: `${req.protocol}://${req.get("host")}/uploads/products/${
              img.image_path
            }`,
            is_primary: img.is_primary,
          })) || [];

        /* ===== VARIANTS ===== */
        let minPrice = null;

        const variations = p.variantCombinations
          .filter((vc) => vc.quantity > 0)
          .map((vc) => {
            const variantBase = basePrice + Number(vc.extra_price || 0);
            const finalPrice = applyTax(variantBase, tax);
            const price = Number(finalPrice.toFixed(2));

            if (minPrice === null || price < minPrice) {
              minPrice = price;
            }

            return {
              id: vc.id,
              sku: vc.sku,
              name: vc.combination_values
                ?.map((cv) => cv.value?.value)
                .join(" / "),
              price,
              stock: vc.quantity,
              images:
                vc.images?.map((img) => ({
                  image_url: `${req.protocol}://${req.get(
                    "host"
                  )}/uploads/variants/${img.image_path}`,
                })) || [],
            };
          });

        if (!variations.length || minPrice === null) return null;

        return {
          id: p.id,
          name: p.name,
          slug: p.slug,

          price: minPrice,

          images,
          image:
            images.find((i) => i.is_primary)?.image_url ||
            images[0]?.image_url ||
            null,

          category: p.category?.id,
          brand: p.brand?.id,

          variations,

          /* ✅ SEO META */
          seo: p.meta
            ? {
                title: p.meta.meta_title,
                description: p.meta.meta_description,
                keywords: p.meta.meta_tags,
              }
            : null,
        };
      })
      .filter(Boolean);

    /* ================= PRICE FILTER ================= */
    if (price_min || price_max) {
      const min = Number(price_min ?? 0);
      const max = Number(price_max ?? Infinity);

      data = data.filter((p) => p.price >= min && p.price <= max);
    }

    /* ================= SORT ================= */
    if (sortBy === "price_low_high") {
      data.sort((a, b) => a.price - b.price);
    }

    if (sortBy === "price_high_low") {
      data.sort((a, b) => b.price - a.price);
    }

    return res.json({ status: true, data });
  } catch (err) {
    console.error("PRODUCT FILTER ERROR:", err);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};
export const getPOSCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ["id", "name", "slug"], // ✅ REMOVE icon
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
