import { body } from "express-validator";

export const updateAppSettingValidator = [
  body("app_name")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Application name must be at least 2 characters"),
];
