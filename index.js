import express from "express";
import cors from "cors";
import sequelize from "./config/dbconfig.js";
import "./models/index.js";
import router from "./routes/index.js";
import { notFound } from "./middleware/404.js";
import { errorHandler } from "./middleware/500.js";
import path from "path";
// import { sendMessage } from "./helpers/360messanger.js";

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

// sendMessage(
//   "9440161007",
//   "Hello World!",
//   "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example",
//   null,
//   (err, result) => {
//     if (err) {
//       console.error("❌ Error:", err);
//     } else {
//       console.log("✅ Response:", result);
//     }
//   }
// );

// ✅ BODY PARSERS (CRITICAL)
app.use(express.json()); // 🔥 THIS FIXES YOUR ISSUE
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
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
