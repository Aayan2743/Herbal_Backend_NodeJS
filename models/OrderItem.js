import { DataTypes } from "sequelize";
import sequelize from "../config/dbconfig.js";
import Order from "./Order.js";
import Product from "./Product.js";
import ProductVariantCombination from "./ProductVariantCombination.js";

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    order_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: Order, // 👈 users table
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
    variation_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: ProductVariantCombination, // 👈 users table
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "order_items",
    timestamps: true,
  }
);

export default OrderItem;
