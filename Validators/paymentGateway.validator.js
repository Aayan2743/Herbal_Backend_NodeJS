import { body } from "express-validator";

export const updatePaymentGatewayValidator = [
  body("razorpay_key").optional().isString(),
  body("razorpay_secret").optional().isString(),
  body("razorpay_enabled").optional().isBoolean(),

  body("cashfree_app_id").optional().isString(),
  body("cashfree_secret").optional().isString(),
  body("cashfree_enabled").optional().isBoolean(),

  body("phonepe_merchant_id").optional().isString(),
  body("phonepe_secret").optional().isString(),
  body("phonepe_enabled").optional().isBoolean(),

  body("cod_enabled").optional().isBoolean(),
];
