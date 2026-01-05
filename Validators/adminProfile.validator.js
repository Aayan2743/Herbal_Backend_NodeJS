import { body } from "express-validator";
import { Op } from "sequelize";
import User from "../models/user.js";

export const updateAdminProfileValidator = [
  /* NAME */
  body("name")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),

  /* EMAIL */
  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (value, { req }) => {
      const userId = req.users.id || req.users.userId;

      const user = await User.findOne({
        where: {
          email: value,
          id: { [Op.ne]: userId }, // exclude current user
        },
      });

      if (user) {
        throw new Error("Email already exists");
      }
      return true;
    }),

  /* PHONE */
  body("phone")
    .optional()
    .matches(/^[0-9+\-\s]{8,15}$/)
    .withMessage("Invalid phone number")
    .custom(async (value, { req }) => {
      const userId = req.users.id || req.users.userId;

      const user = await User.findOne({
        where: {
          phone: value,
          id: { [Op.ne]: userId }, // exclude current user
        },
      });

      if (user) {
        throw new Error("Phone number already exists");
      }
      return true;
    }),

  /* PASSWORD */
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];
