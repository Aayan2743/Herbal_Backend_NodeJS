import { DataTypes } from "sequelize";
import sequelize from "../config/dbconfig.js";
import User from "./user.js";

const Address = sequelize.define(
  "Address",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

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

    name: DataTypes.STRING,
    phone: DataTypes.STRING,
    address: DataTypes.TEXT,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    country: DataTypes.STRING,
    pincode: DataTypes.STRING,

    is_default: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    tableName: "addresses",
    timestamps: true,
  }
);

export default Address;
