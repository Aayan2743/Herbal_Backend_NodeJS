import { validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.array()[0].msg,
    });
  }

  next(); // 🔥 REQUIRED
};
