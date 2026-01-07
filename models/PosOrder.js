import { DataTypes } from "sequelize";
import sequelize from "../config/dbconfig.js";

const PosOrder = sequelize.define("PosOrder", {
  id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  order_no: DataTypes.STRING,
  customer_name: DataTypes.STRING,
  customer_phone: DataTypes.STRING,

  subtotal: DataTypes.DECIMAL,
  gst_enabled: DataTypes.BOOLEAN,
  gst_percent: DataTypes.DECIMAL,
  gst_amount: DataTypes.DECIMAL,

  discount: DataTypes.DECIMAL,
  total: DataTypes.DECIMAL,

  payment_mode: DataTypes.STRING,
  payment_status: DataTypes.STRING,

  created_by: DataTypes.BIGINT,
});

export default PosOrder;
