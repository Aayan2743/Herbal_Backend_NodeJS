import { DataTypes } from "sequelize";
import sequelize from "../config/dbconfig.js";
import slugify from "slugify";

const Category = sequelize.define(
  "Category",
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
    //   unique: true,
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
    tableName: "categories",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",

    hooks: {
      beforeValidate: (category) => {
        if (category.name && !category.slug) {
          category.slug = slugify(category.name, {
            lower: true,
            strict: true,
          });
        }
      },
      beforeUpdate: (category) => {
        if (category.changed("name")) {
          category.slug = slugify(category.name, {
            lower: true,
            strict: true,
          });
        }
      },
    },
  }
);

export default Category;
