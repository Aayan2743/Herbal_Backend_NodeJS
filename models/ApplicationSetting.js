import { DataTypes } from "sequelize";
import sequelize from "../config/dbconfig.js";

const ApplicationSetting = sequelize.define(
  "ApplicationSetting",
  {
    app_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    favicon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "application_settings",
  }
);

export default ApplicationSetting;
