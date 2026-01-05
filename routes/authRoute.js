import express from "express";
import { body } from "express-validator";
import {
  register,
  // login,
  profile,
  userlogin,adminlogin
} from "../controllers/auth/authControllers.js";
import {
  RegisterValidator,
  // LoginValidator,
  UserLoginValidator,AdminLoginValidator
} from "../Validators/registerValidator.js";
import tokenAuth from "../middleware/tokenAuth.js";
export const authRouter = express.Router();

authRouter.post("/register", RegisterValidator, register);
authRouter.post("/user-login", UserLoginValidator, userlogin);
authRouter.post("/admin-login", AdminLoginValidator, adminlogin);
authRouter.get("/profile", tokenAuth, profile);
