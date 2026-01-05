import express from "express";

import {
  createCategory,
  listCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/dashboard/category.controller.js";
import { validate } from "../middleware/validate.js";
import tokenAuth from "../middleware/tokenAuth.js";
import { upload } from "../middleware/upload.js";
import { uploadCategory } from "../middleware/uploadCategory.js";
import {
  addCategory,
  getCategoryValidator,
  listCategoriesValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} from "../Validators/categoryValidators.js";
import {
  createBrand,
  listBrands,
  getBrand,
  updateBrand,
  deleteBrand,
} from "../controllers/dashboard/brand.controller.js";

import {
  createBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
  listBrandValidator,
} from "../Validators/brand.validator.js";
import {
  getAdminProfile,
  updateAdminProfile,
} from "../controllers/dashboard/adminProfile.controller.js";
import { updateAdminProfileValidator } from "../Validators/adminProfile.validator.js";
import { updateAppSettingValidator } from "../Validators/applicationSetting.validator.js";
import {
  getAppSettings,
  updateAppSettings,
} from "../controllers/dashboard/applicationSetting.controller.js";
import {
  getSocialMediaSettings,
  updateSocialMediaSettings,
} from "../controllers/dashboard/socialMedia.controller.js";
import { updateSocialMediaValidator } from "../Validators/socialMedia.validator.js";
import { updatePaymentGatewayValidator } from "../Validators/paymentGateway.validator.js";
import {
  getPaymentGateways,
  updatePaymentGateways,
} from "../controllers/dashboard/paymentGateway.controller.js";
import {
  addValueValidator,
  createVariationValidator,
  updateVariationValidator,
} from "../Validators/variation.validator.js";
import {
  addVariationValue,
  createVariation,
  deleteVariation,
  deleteVariationValue,
  getVariations,
  updateVariation,
  updateVariationValue,
} from "../controllers/dashboard/variation.controller.js";

export const dashboardRouter = express.Router();

// All Category Routes will be here later
dashboardRouter.post(
  "/add-category",
  tokenAuth,
  uploadCategory.single("image"),
  addCategory, // rules
  validate, // 🔥 this checks & calls next()
  createCategory
);

dashboardRouter.get(
  "/list-category",
  tokenAuth,
  listCategoriesValidator,
  validate,
  listCategories
);

dashboardRouter.get(
  "/get-category/:id",
  tokenAuth,
  getCategoryValidator,
  validate,
  getCategory
);

dashboardRouter.put(
  "/update-category/:id",
  tokenAuth,
  uploadCategory.single("image"),
  updateCategoryValidator,
  validate,
  updateCategory
);

dashboardRouter.delete(
  "/delete-category/:id",
  tokenAuth,
  deleteCategoryValidator,
  validate,
  deleteCategory
);

// All Brand Routes will be here later
dashboardRouter.post(
  "/add-brand",
  tokenAuth,
  uploadCategory.single("image"),
  createBrandValidator,
  validate,
  createBrand
);

dashboardRouter.get(
  "/get-brands",
  tokenAuth,
  listBrandValidator,
  validate,
  listBrands
);

dashboardRouter.get("/get-brand/:id", tokenAuth, getBrand);

dashboardRouter.put(
  "/update-brand/:id",
  tokenAuth,
  uploadCategory.single("image"),
  updateBrandValidator,
  validate,
  updateBrand
);

dashboardRouter.delete(
  "/delete-brand/:id",
  tokenAuth,
  deleteBrandValidator,
  validate,
  deleteBrand
);

// admin profile routes
dashboardRouter.get("/profile", tokenAuth, getAdminProfile);
dashboardRouter.put(
  "/update-profile",
  tokenAuth,
  uploadCategory.fields([{ name: "avatar", maxCount: 1 }]),
  updateAdminProfileValidator,
  validate,
  updateAdminProfile
);

// setting logo and favicon upload will be here later
dashboardRouter.get("/logo-settings", tokenAuth, getAppSettings);
dashboardRouter.get("/logo-settings-open", getAppSettings);
dashboardRouter.put(
  "/update-logo-settings",
  tokenAuth,
  uploadCategory.fields([
    { name: "logo", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
  ]),
  updateAppSettingValidator,
  validate,
  updateAppSettings
);

// Social Media Settings routes will be here later
dashboardRouter.get("/social-media", tokenAuth, getSocialMediaSettings);
dashboardRouter.put(
  "/social-media",
  tokenAuth,
  updateSocialMediaValidator,
  validate,
  updateSocialMediaSettings
);

// payment gateway routes will be here later
dashboardRouter.get("/get-payment-gateways", tokenAuth, getPaymentGateways);

dashboardRouter.put(
  "/update-payment-gateways",
  tokenAuth,
  updatePaymentGatewayValidator,
  validate,
  updatePaymentGateways
);
// variation routes will be here later
dashboardRouter.post(
  "/add-variation",
  createVariationValidator,
  validate,
  createVariation
);
dashboardRouter.get("/get-variations", getVariations);
dashboardRouter.put(
  "/update-variations/:id",
  updateVariationValidator,
  validate,
  updateVariation
);
dashboardRouter.delete("/delete-variations/:id", deleteVariation);

/* VALUES */
dashboardRouter.post(
  "/add-variation-value/:variationId",
  addValueValidator,
  validate,
  addVariationValue
);

dashboardRouter.put(
  "/update-variation-value/:id",
  updateVariationValidator,
  validate,
  updateVariationValue
);

dashboardRouter.delete(
  "/delete-variation-value/:valueId",
  deleteVariationValue
);

// Product routes will be here later
