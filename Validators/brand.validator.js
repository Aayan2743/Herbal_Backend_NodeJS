import { body, param, query } from "express-validator";

export const createBrandValidator = [
  body("name").notEmpty().withMessage("Brand name is required"),
];

export const updateBrandValidator = [
  param("id").isInt().withMessage("Invalid brand id"),
  body("name").notEmpty().withMessage("Brand name is required"),
];

export const deleteBrandValidator = [
  param("id").isInt().withMessage("Invalid brand id"),
];

export const listBrandValidator = [
  query("page").optional().isInt({ min: 1 }),
  query("perPage").optional().isInt({ min: 1, max: 100 }),
];
