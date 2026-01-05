import { DataTypes } from "sequelize";
import sequelize from "../config/dbconfig.js";
import Product from "./Product.js";
import ProductVariantCombinationValue from "./ProductVariantCombinationValue.js";

const ProductVariantCombination = sequelize.define(
  "ProductVariantCombination",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    product_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    sku: DataTypes.STRING,
    extra_price: DataTypes.DECIMAL(10, 2),
    quantity: DataTypes.INTEGER,
    low_quantity: DataTypes.INTEGER,
  },
  {
    tableName: "product_variant_combinations",
    underscored: true,
  }
);

ProductVariantCombination.hasMany(ProductVariantCombinationValue, {
  foreignKey: "variant_combination_id",
  as: "values",
});

ProductVariantCombinationValue.belongsTo(ProductVariantCombination, {
  foreignKey: "variant_combination_id",
});

export default ProductVariantCombination;
