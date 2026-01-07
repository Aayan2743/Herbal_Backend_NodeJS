import { DataTypes } from "sequelize";
import sequelize from "../config/dbconfig.js";

const ProductVariation = sequelize.define(
  "ProductVariation",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("text", "color"),
      defaultValue: "text",
    },
  },
  {
    tableName: "product_variations",
    timestamps: true,
    underscored: true,
  }
);

export default ProductVariation;
