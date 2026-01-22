// models/Order.js
import { DataTypes } from "sequelize";
import sequelize from "../config/dbconfig.js";
import User from "./user.js";
import Address from "./Address.js";
// import sequelize from "../config/database.js";

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
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

  address_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Address, // 👈 users table
      key: "id",
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },

  coupon_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },

  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  payment_method: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  payment_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  payment_status: {
    type: DataTypes.STRING,
    defaultValue: "paid",
  },

  order_status: {
    type: DataTypes.STRING,
    defaultValue: "placed",
  },
});

export default Order;
