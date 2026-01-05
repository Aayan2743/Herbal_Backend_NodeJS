import { DataTypes } from "sequelize";
import sequelize from "../config/dbconfig.js";

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    name: DataTypes.STRING,
    category_id: DataTypes.BIGINT.UNSIGNED,
    brand_id: DataTypes.BIGINT.UNSIGNED,

    description: {
      type: DataTypes.TEXT, // ✅ IMPORTANT
      allowNull: true,
    },

    base_price: DataTypes.DECIMAL(10, 2),
    discount: DataTypes.DECIMAL(10, 2),

    status: {
      type: DataTypes.STRING,
      defaultValue: "draft",
    },
  },
  {
    tableName: "products",
    underscored: true,
  }
);

export default Product;
