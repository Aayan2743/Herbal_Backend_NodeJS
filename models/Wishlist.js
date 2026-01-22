import { DataTypes } from "sequelize";
import sequelize from "../config/dbconfig.js";
import User from "./user.js";
import Product from "./Product.js";
// import sequelize from "../config/db.js";

const Wishlist = sequelize.define(
  "wishlist",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: User, // 👈 users table
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    product_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: Product, // 👈 users table
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "wishlists",
    timestamps: true,
  },
);

export default Wishlist;
