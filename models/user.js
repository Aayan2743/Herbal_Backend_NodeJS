import { DataTypes } from "sequelize";
import sequelize from "../config/dbconfig.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
      phone: {
      type: DataTypes.BIGINT,
      allowNull: false,
      // unique: true,
    },


    role: {
      type: DataTypes.ENUM("admin", "user", "staff"),
      allowNull: false,
      defaultValue: "user",
    },

     avatar: {
      type: DataTypes.STRING,
      // allowNull: TRUE,
     
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default User;
