import { DataTypes } from "sequelize";
import sequelize from "../config/dbconfig.js";
import User from "./user.js";
// import User from ""

const CartItem = sequelize.define(
  "CartItem",
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
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    variation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: "cart_items",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "product_id", "variation_id"],
      },
    ],
  }
);

export default CartItem;
