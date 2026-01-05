import express from "express";
import adminRouter from "./apiRoutes.js";
import { authRouter } from "./authRoute.js";
import { dashboardRouter } from "./dashboardRoutes.js";
import { productRouter } from "./productRoutes.js";
import { posRouter } from "./posRoutes.js";

const router = express.Router();

router.use("/admin", adminRouter);
router.use("/auth", authRouter);
router.use("/dashboard", dashboardRouter);
router.use("/dashboard/product", productRouter);
router.use("/dashboard/pos", posRouter);
export default router;
