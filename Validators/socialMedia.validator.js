import { body } from "express-validator";

const urlOptions = {
  require_protocol: true,
  allow_underscores: true,
  allow_trailing_dot: false,
  allow_protocol_relative_urls: false,
  require_tld: false, // allows localhost
};

export const updateSocialMediaValidator = [
  body("linkedin")
    .optional({ checkFalsy: true }) // ✅ allows empty ""
    .isURL(urlOptions)
    .withMessage("Invalid LinkedIn URL"),

  body("dribbble")
    .optional({ checkFalsy: true })
    .isURL(urlOptions)
    .withMessage("Invalid Dribbble URL"),

  body("instagram")
    .optional({ checkFalsy: true })
    .isURL(urlOptions)
    .withMessage("Invalid Instagram URL"),

  body("twitter")
    .optional({ checkFalsy: true })
    .isURL(urlOptions)
    .withMessage("Invalid Twitter/X URL"),

  body("youtube")
    .optional({ checkFalsy: true })
    .isURL(urlOptions)
    .withMessage("Invalid YouTube URL"),
];
