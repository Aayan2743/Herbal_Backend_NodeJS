import express from "express";
import { body } from "express-validator";
import {
  register,
  // login,
  profile,
  userlogin,
  adminlogin,
  sendOtp,
  verifyOtp,
  updateProfile,
  changePassword,
} from "../controllers/auth/authControllers.js";
import {
  RegisterValidator,
  // LoginValidator,
  UserLoginValidator,
  AdminLoginValidator,
} from "../Validators/registerValidator.js";
import tokenAuth from "../middleware/tokenAuth.js";
import { uploadCategory } from "../middleware/uploadCategory.js";
export const authRouter = express.Router();

authRouter.post("/register", RegisterValidator, register);
authRouter.post("/user-login", UserLoginValidator, userlogin);
authRouter.post("/admin-login", AdminLoginValidator, adminlogin);
authRouter.get("/profile", tokenAuth, profile);

authRouter.post("/send-otp", sendOtp);
authRouter.post("/verify-otp", verifyOtp);

authRouter.post(
  "/profile/update",
  tokenAuth,
  uploadCategory.single("profile_image"),
  updateProfile,
);

authRouter.post("/profile/change-password", tokenAuth, changePassword);
