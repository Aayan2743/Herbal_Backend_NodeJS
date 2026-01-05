import { DataTypes } from "sequelize";
import sequelize from "../config/dbconfig.js";

const SocialMediaSetting = sequelize.define(
  "SocialMediaSetting",
  {
    linkedin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dribbble: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    instagram: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    twitter: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    youtube: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "social_media_settings",
  }
);

export default SocialMediaSetting;
