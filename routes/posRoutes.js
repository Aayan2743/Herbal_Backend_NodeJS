import express from "express";
import {
  createProduct,
  fetchProducts,
  getPOSBrands,
  getPOSCategories,
  getPOSProducts,
  getProductById,
  publishProduct,
  syncVariations,
  updateProduct,
  updateProductMeta,
  updateProductTax,
  updateVariant,
} from "../controllers/dashboard/products.controller.js";

import { addProductValidator } from "../Validators/product.validator.js";
import { productVideoValidator } from "../Validators/productVideo.validator.js";

import tokenAuth from "../middleware/tokenAuth.js";
import { validate } from "../middleware/validate.js";
import { uploadCategory } from "../middleware/uploadCategory.js";
import {
  deleteProductImage,
  setMainProductImage,
  uploadProductImage,
} from "../controllers/dashboard/productImages.controller.js";
import { saveProductVideo } from "../controllers/dashboard/productVideo.controller.js";
import {
  saveProductVariants,
  uploadVariantImages,
} from "../controllers/dashboard/productVariant.controller.js";
import { saveProductSeo } from "../controllers/dashboard/productSeoSave.controller.js";
import { saveProductTaxAffinity } from "../controllers/dashboard/saveProductTaxAffinity.controller.js";
import { uploadVariantImagesFile } from "../middleware/upload1.js";
export const posRouter = express.Router();

posRouter.get("/products", getPOSProducts);
posRouter.get("/categories", getPOSCategories);
posRouter.get("/brands", getPOSBrands);
