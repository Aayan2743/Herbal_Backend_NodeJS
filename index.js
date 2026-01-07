import express from "express";
import cors from "cors";
import sequelize from "./config/dbconfig.js";
import "./models/index.js";
import router from "./routes/index.js";
import { notFound } from "./middleware/404.js";
import { errorHandler } from "./middleware/500.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");

// ✅ CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ BODY PARSERS (CRITICAL)
app.use(express.json()); // 🔥 THIS FIXES YOUR ISSUE
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static("public/uploads"));

// DB
sequelize
  .authenticate()
  .then(async () => {
    // await sequelize.sync({ alter: true });
    await sequelize.sync();
    console.log("Database connected successfully.");
  })
  .catch(console.error);

// Routes
app.use("/api", router);

// Errors
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
