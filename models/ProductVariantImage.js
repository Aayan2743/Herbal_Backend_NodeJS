import { DataTypes } from "sequelize";
import sequelize from "../config/dbconfig.js";

const ProductVariantImage = sequelize.define(
  "ProductVariantImage",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    variant_combination_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    image_path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "product_variant_images",
    underscored: true,
    timestamps: true,
  }
);

export default ProductVariantImage;
