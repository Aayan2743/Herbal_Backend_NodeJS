import { DataTypes } from "sequelize";
import sequelize from "../config/dbconfig.js";
import Product from "./Product.js";

const ProductSeoMeta = sequelize.define(
  "ProductSeoMeta",
  {
    product_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    meta_title: {
      type: DataTypes.STRING(60),
    },

    meta_description: {
      type: DataTypes.STRING(160),
    },

    meta_tags: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "product_seo_meta",
    underscored: true,
    timestamps: true,
  }
);

Product.hasOne(ProductSeoMeta, {
  foreignKey: "product_id",
  as: "seo",
});

ProductSeoMeta.belongsTo(Product, {
  foreignKey: "product_id",
});

export default ProductSeoMeta;
