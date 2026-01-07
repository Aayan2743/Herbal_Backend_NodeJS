import { DataTypes } from "sequelize";
import sequelize from "../config/dbconfig.js";

const PosOrderItem = sequelize.define("PosOrderItem", {
  pos_order_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },

  product_id: DataTypes.BIGINT.UNSIGNED,
  variation_id: DataTypes.BIGINT,

  product_name: DataTypes.STRING,
  variation_name: DataTypes.STRING,

  price: DataTypes.DECIMAL,
  qty: DataTypes.INTEGER,
  total: DataTypes.DECIMAL,
});

export default PosOrderItem;
