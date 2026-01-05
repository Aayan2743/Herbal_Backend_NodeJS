import express from "express";
import { register } from "../controllers/auth/authControllers.js";
import { body } from "express-validator";

const adminRouter = express.Router();

adminRouter.get("/profile", (req, res) => {
  res.send("User Profile");
});

adminRouter.get("/products", (req, res) => {
  res.send("User products");
});

adminRouter.post("/add-new-user", register);

export default adminRouter;
