import { DataTypes } from "sequelize";
import sequelize from "../config/dbconfig.js";

const PaymentGateway = sequelize.define(
  "PaymentGateway",
  {
    razorpay_key: DataTypes.STRING,
    razorpay_secret: DataTypes.STRING,
    razorpay_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    cashfree_app_id: DataTypes.STRING,
    cashfree_secret: DataTypes.STRING,
    cashfree_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    phonepe_merchant_id: DataTypes.STRING,
    phonepe_secret: DataTypes.STRING,
    phonepe_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    cod_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "payment_gateways",
  }
);

export default PaymentGateway;
