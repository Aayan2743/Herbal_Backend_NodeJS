import { DataTypes } from "sequelize";
import sequelize from "../config/dbconfig.js";
import Product from "./Product.js";

const ProductVideo = sequelize.define(
  "ProductVideo",
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

    video_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
  },
  {
    tableName: "product_videos",
    underscored: true,
  }
);

export default ProductVideo;
