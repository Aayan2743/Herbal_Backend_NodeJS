import { body, param } from "express-validator";

export const createVariationValidator = [
  body("name").notEmpty().withMessage("Variation name required"),
  body("type").isIn(["text", "color"]).withMessage("Invalid variation type"),
];

export const addValueValidator = [
  param("variationId").isInt(),
  body("value").notEmpty().withMessage("Value is required"),
  body("color_code")
    .optional()
    .matches(/^#([0-9A-Fa-f]{6})$/)
    .withMessage("Invalid hex color"),
];

export const updateVariationValidator = [
  /* PARAM */
  param("id").isInt().withMessage("Invalid variation ID"),

  /* BODY */
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Variation name cannot be empty"),

  body("type")
    .optional()
    .isIn(["text", "color"])
    .withMessage("Variation type must be text or color"),
];
