import { DataTypes } from "sequelize";
import sequelize from "../config/dbconfig.js";
import Product from "./Product.js";

const ProductImage = sequelize.define(
  "ProductImage",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    product_id: {
      type: DataTypes.BIGINT.UNSIGNED, // 🔥 MATCH EXACTLY
      allowNull: false,
    },

    image_path: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "product_images",
    underscored: true,
  }
);

// Relations
// Product.hasMany(ProductImage, {
//   foreignKey: "product_id",
//   as: "images",
// });

// ProductImage.belongsTo(Product, {
//   foreignKey: "product_id",
// });

export default ProductImage;
