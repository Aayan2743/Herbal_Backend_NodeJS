import { DataTypes } from "sequelize";

import sequelize from "../config/dbconfig.js";
import slugify from "slugify";

const Brand = sequelize.define(
  "Brand",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    //   unique: true, // ✅ recommended
    },

    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
    },
  },
  {
    tableName: "brands",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",

    hooks: {
      beforeValidate: (brand) => {
        if (brand.name && !brand.slug) {
          brand.slug = slugify(brand.name, {
            lower: true,
            strict: true,
          });
        }
      },
      beforeUpdate: (brand) => {
        if (brand.changed("name")) {
          brand.slug = slugify(brand.name, {
            lower: true,
            strict: true,
          });
        }
      },
    },
  }
);

export default Brand;
