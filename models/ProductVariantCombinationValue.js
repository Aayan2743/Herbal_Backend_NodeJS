

import { DataTypes } from "sequelize";
import sequelize from "../config/dbconfig.js";

const ProductVariantCombinationValue = sequelize.define(
  "ProductVariantCombinationValue",
  {
    variant_combination_id: {
      type: DataTypes.BIGINT.UNSIGNED, // 🔥 MATCH EXACTLY
      allowNull: false,
      primaryKey: true,
    },

    variation_value_id: {
      type: DataTypes.INTEGER.UNSIGNED, // 🔥 MATCH EXACTLY
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    tableName: "product_variant_combination_values",
    timestamps: false,
    underscored: true,
  }
);

export default ProductVariantCombinationValue;
