import express from "express";
import {
  createProduct,
  fetchProducts,
  getProductById,
  getProductBySlug,
  getProductsAll,
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
export const productRouter = express.Router();

// dashboard/product

productRouter.post(
  "/create-product",
  tokenAuth,
  addProductValidator,
  validate,
  createProduct
);

productRouter.put("/update-product/:id", updateProduct);

productRouter.post(
  "/:productId/images",
  uploadCategory.array("images", 10), // ✅ reuse existing
  uploadProductImage
);

productRouter.post(
  "/:productId/video",
  productVideoValidator,
  validate,
  saveProductVideo
);

productRouter.post("/create-variation/:productId", saveProductVariants);

productRouter.post(
  "/variant/:variantCombinationId/images",
  uploadCategory.array("images", 10),
  uploadVariantImages
);

productRouter.post("/create-seo/:productId", saveProductSeo);

productRouter.post("/:productId/tax-affinity", saveProductTaxAffinity);
productRouter.post("/:productId/publish", publishProduct);
productRouter.get("/products", fetchProducts);
productRouter.get("/products123", getProductsAll);
productRouter.get("/fetch-products-by-id/:id", getProductById);
productRouter.get("/products1/:slug", getProductBySlug);

productRouter.post(
  "/product/:productId/images",
  uploadCategory.array("images", 10),
  uploadProductImage
);

productRouter.delete("/product-delete/:imageId", deleteProductImage);

productRouter.post("/:productId/set-main-image", setMainProductImage);

productRouter.put(
  "/update-variant-combination/:id",
  uploadCategory.array("images", 10),
  updateVariant
);

productRouter.post(
  "/sync-variations/:productId",
  uploadVariantImagesFile.any(), // IMPORTANT
  syncVariations
);

productRouter.post("/update-meta/:productId", updateProductMeta);

productRouter.post("/update-tax/:productId", updateProductTax);
