import { DataTypes } from "sequelize";
import sequelize from "../config/dbconfig.js";
import Product from "./Product.js";

const ProductTaxAffinity = sequelize.define(
  "ProductTaxAffinity",
  {
    product_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    gst_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    gst_type: {
      type: DataTypes.ENUM("inclusive", "exclusive"),
      defaultValue: "exclusive",
    },

    gst_percent: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },

    affinity_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    affinity_percent: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
  },
  {
    tableName: "product_tax_affinity",
    underscored: true,
    timestamps: true,
  }
);

Product.hasOne(ProductTaxAffinity, {
  foreignKey: "product_id",
  as: "tax_affinity",
});

ProductTaxAffinity.belongsTo(Product, {
  foreignKey: "product_id",
});

export default ProductTaxAffinity;
