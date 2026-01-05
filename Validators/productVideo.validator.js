import { body, param } from "express-validator";

export const productVideoValidator = [
  param("productId").isInt().withMessage("Invalid product id"),

  body("video_url")
    .notEmpty()
    .withMessage("Video URL is required")
    .isURL({
      require_protocol: true,
      allow_underscores: true,
      allow_trailing_dot: false,
      allow_protocol_relative_urls: false,
      require_tld: false, // 🔥 THIS ALLOWS localhost
    })
    .withMessage("Video URL must be valid"),
];
