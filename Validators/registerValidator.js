import { body, query, param } from "express-validator";
import User from "../models/user.js";
import Product from "../models/Product.js";
import { Op } from "sequelize";

export const RegisterValidator = [
  body("name").notEmpty().withMessage("Name field is required"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (val) => {
      const user = await User.findOne({ where: { email: val } });
      if (user) {
        throw new Error("Email already exists");
      }
      return true;
    }),

  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isNumeric()
    .withMessage("Phone must contain only numbers")
    .isLength({ min: 10, max: 12 })
    .withMessage("Phone number must be 10 digits")
    .custom(async (val) => {
      const user = await User.findOne({ where: { phone: val } });
      if (user) {
        throw new Error("Phone number already exists");
      }
      return true;
    }),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6, max: 12 })
    .withMessage("Password must be 6–12 characters"),
];

export const UserLoginValidator = [
  body("username")
    .notEmpty()
    .withMessage("Email or Phone is required")
    .custom(async (val) => {
      const user = await User.findOne({
        where: {
          role: "user", // ✅ enforce role
          [Op.or]: [{ email: val }, { phone: val }],
        },
      });

      if (!user) {
        throw new Error("Invalid username / phone number");
      }
      return true;
    }),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6, max: 12 })
    .withMessage("Password must be 6–12 characters"),
];

export const AdminLoginValidator = [
  body("username")
    .notEmpty()
    .withMessage("Email or Phone is required")
    .custom(async (val) => {
      const user = await User.findOne({
        where: {
          role: "admin", // ✅ enforce role
          [Op.or]: [{ email: val }, { phone: val }],
        },
      });

      if (!user) {
        throw new Error("Invalid username / phone number");
      }
      return true;
    }),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6, max: 12 })
    .withMessage("Password must be 6–12 characters"),
];

export const ProductAdding = [
  body("productname").notEmpty().withMessage("Product Name required"),

  body("amount")
    .notEmpty()
    .withMessage("Amount required")
    .isNumeric()
    .withMessage("Only Number Allowed")
    .isFloat({ min: 10, max: 999 }),
];

export const getProductValidator = [
  param("id")
    .notEmpty()
    .withMessage("Product Id required")
    .custom(async (val) => {
      const product = await Product.findOne({ where: { id: val } });
      if (!product) {
        throw new Error("Invalid Product id / No Product Found");
      }

      return true;
    }),
];

export const ProductupdatingValidator = [
  body("productname").notEmpty().withMessage("Product Name required"),

  body("amount")
    .notEmpty()
    .withMessage("Amount required")
    .isNumeric()
    .withMessage("Only Number Allowed")
    .isFloat({ min: 10, max: 999 }),
];

export const ProductdeleteValidator = [
  param("id")
    .notEmpty()
    .withMessage("Product Id  required")
    .custom(async (val) => {
      const exists = await Product.findByPk(val);
      if (!exists) {
        throw new Error("Product id Not Found");
      }
      return true;
    }),
];
