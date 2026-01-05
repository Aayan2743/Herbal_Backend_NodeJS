import { body, query, param } from "express-validator";



export const addCategory = [
  body("name")
    .notEmpty()
    .withMessage("Name field is required"),
];

export const getCategoryValidator = [
  param("id")
    .notEmpty()
    .withMessage("Category id is required")
    .isInt()
    .withMessage("Category id must be a valid integer"),
];



export const listCategoriesValidator = [
  query("search")
    .optional()
    .isString()
    .withMessage("Search must be a string"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a number greater than 0"),

  query("perPage")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("PerPage must be between 1 and 100"),
];

export const updateCategoryValidator = [
  param("id")
    .notEmpty()
    .withMessage("Category id is required")
    .isInt()
    .withMessage("Category id must be a valid number"),

  body("name")
    .notEmpty()
    .withMessage("Category name is required"),
];

/* 🗑 DELETE CATEGORY */
export const deleteCategoryValidator = [
  param("id")
    .notEmpty()
    .withMessage("Category id is required")
    .isInt()
    .withMessage("Category id must be a valid number"),
];