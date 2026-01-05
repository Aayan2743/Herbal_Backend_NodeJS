import { DataTypes } from "sequelize";
import sequelize from "../config/dbconfig.js";
import ProductVariation from "./ProductVariation.js";
import ProductVariantCombinationValue from "./ProductVariantCombinationValue.js";

const ProductVariationValue = sequelize.define(
  "ProductVariationValue",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    variation_id: DataTypes.INTEGER.UNSIGNED,
    value: DataTypes.STRING,
    color_code: DataTypes.STRING,
  },
  {
    tableName: "product_variation_values",
    underscored: true,
  }
);

export default ProductVariationValue;
