import { body, param } from "express-validator";

/* ➕ CREATE PRODUCT (STEP 1) */
export const addProductValidator = [
  body("name")
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ min: 3 })
    .withMessage("Product name must be at least 3 characters"),

  body("category_id")
    .notEmpty()
    .withMessage("Category is required")
    .isInt()
    .withMessage("Category must be a valid number"),

  body("brand_id")
    .optional()
    .isInt()
    .withMessage("Brand must be a valid number"),

  body("description").notEmpty().withMessage("description required"),

  body("base_price")
    .notEmpty()
    .withMessage("Base price is required")
    .isFloat({ gt: 0 })
    .withMessage("Base price must be greater than 0"),

  body("discount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Discount cannot be negative"),
];

/* 📄 GET PRODUCT BY ID */
export const getProductValidator = [
  param("id")
    .notEmpty()
    .withMessage("Product id is required")
    .isInt()
    .withMessage("Product id must be a valid number"),
];

/* ✏ UPDATE PRODUCT */
export const updateProductValidator = [
  param("id")
    .notEmpty()
    .withMessage("Product id is required")
    .isInt()
    .withMessage("Product id must be a valid number"),

  body("name")
    .optional()
    .notEmpty()
    .withMessage("Product name cannot be empty"),

  body("base_price")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Base price must be greater than 0"),

  body("discount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Discount cannot be negative"),
];
