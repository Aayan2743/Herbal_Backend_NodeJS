// models/index.js

import User from "./user.js";
import Product from "./Product.js";
import Category from "./Category.js";
import Brand from "./Brand.js";
import ApplicationSetting from "./ApplicationSetting.js";
import SocialMediaSetting from "./SocialMediaSetting.js";
import PaymentGateway from "./PaymentGateway.js";

import ProductImage from "./ProductImage.js";
import ProductVideo from "./ProductVideo.js";
import ProductSeoMeta from "./ProductSeoMeta.js";
import ProductTaxAffinity from "./ProductTaxAffinity.js";

import ProductVariation from "./ProductVariation.js";
import ProductVariationValue from "./ProductVariationValue.js";

import ProductVariantCombination from "./ProductVariantCombination.js";
import ProductVariantCombinationValue from "./ProductVariantCombinationValue.js";
import ProductVariantImage from "./ProductVariantImage.js";
import PosOrderItem from "./PosOrderItem.js";
import PosOrder from "./PosOrder.js";

PosOrder.hasMany(PosOrderItem, {
  foreignKey: "pos_order_id",
  as: "items",
});

// EACH ITEM → ONE ORDER
PosOrderItem.belongsTo(PosOrder, {
  foreignKey: "pos_order_id",
  as: "order",
});

PosOrderItem.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});
/* =====================================================
   CATEGORY & BRAND
===================================================== */

Product.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});

Category.hasMany(Product, {
  foreignKey: "category_id",
});

Product.belongsTo(Brand, {
  foreignKey: "brand_id",
  as: "brand",
});

Brand.hasMany(Product, {
  foreignKey: "brand_id",
});

/* =====================================================
   PRODUCT CORE RELATIONS
===================================================== */

/* =====================================================
   PRODUCT CORE
===================================================== */

Product.hasMany(ProductImage, {
  foreignKey: "product_id",
  as: "gallery",
});

Product.hasOne(ProductSeoMeta, {
  foreignKey: "product_id",
  as: "meta",
});

// Product.hasOne(ProductTaxAffinity, {
//   foreignKey: "product_id",
//   as: "product_tax",
// });

Product.hasMany(ProductTaxAffinity, {
  foreignKey: "product_id",
  as: "product_tax",
});

Product.hasOne(ProductVideo, {
  foreignKey: "product_id",
  as: "video",
});

/* =====================================================
   VARIANT COMBINATIONS
===================================================== */

ProductVariantCombination.hasMany(ProductVariantImage, {
  foreignKey: "variant_combination_id",
  as: "images",
});

ProductVariantImage.belongsTo(ProductVariantCombination, {
  foreignKey: "variant_combination_id",
});

Product.hasMany(ProductVariantCombination, {
  foreignKey: "product_id",
  as: "variantCombinations",
});

ProductVariantCombination.belongsTo(Product, {
  foreignKey: "product_id",
});

ProductVariantCombination.hasMany(ProductVariantCombinationValue, {
  foreignKey: "variant_combination_id",
  as: "combination_values",
});

ProductVariantCombinationValue.belongsTo(ProductVariantCombination, {
  foreignKey: "variant_combination_id",
  as: "variant",
});

ProductVariantCombinationValue.belongsTo(ProductVariationValue, {
  foreignKey: "variation_value_id",
  as: "value",
});

ProductVariationValue.hasMany(ProductVariantCombinationValue, {
  foreignKey: "variation_value_id",
  as: "combination_values",
});

/* =====================================================
   VARIATIONS MASTER
===================================================== */

ProductVariation.hasMany(ProductVariationValue, {
  foreignKey: "variation_id",
  as: "variation_values",
});

ProductVariationValue.belongsTo(ProductVariation, {
  foreignKey: "variation_id",
  as: "variation",
});

/* =====================================================
   EXPORT ALL MODELS
===================================================== */

export {
  User,
  Product,
  Category,
  Brand,
  ApplicationSetting,
  SocialMediaSetting,
  PaymentGateway,
  ProductImage,
  ProductVideo,
  ProductSeoMeta,
  ProductTaxAffinity,
  ProductVariation,
  ProductVariationValue,
  ProductVariantCombination,
  ProductVariantCombinationValue,
  ProductVariantImage,
  PosOrderItem,
  PosOrder,
};
