import { DataTypes } from "sequelize";
import sequelize from "../config/dbconfig.js";

const Otp = sequelize.define(
  "Otp",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    otp: {
      type: DataTypes.STRING(6),
      allowNull: false,
    },

    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    is_used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "otps",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",

    indexes: [
      {
        fields: ["phone"],
      },
    ],
  }
);

export default Otp;
