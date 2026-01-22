import { DataTypes } from "sequelize";
import sequelize from "../config/dbconfig.js";
// import sequelize from "../config/database.js";

const Coupon = sequelize.define(
  "Coupon",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    type: {
      type: DataTypes.ENUM("flat", "percent"),
      allowNull: false,
      comment: "flat = ₹ discount, percent = % discount",
    },

    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "Discount value",
    },

    min_order: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    max_discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    expiry_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "coupons",
    timestamps: true, // ✅ creates createdAt & updatedAt
  }
);

export default Coupon;
