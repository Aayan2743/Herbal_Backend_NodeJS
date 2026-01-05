//src/controllers/dashboard/category.controller.js


import Category from "../../models/Category.js";
import { convertToWebp } from "../../utils/webpConverter.js";
import { getImageUrl } from "../../utils/getFullUrl.js";
import { Op } from "sequelize";
import path from "path";
import fs from "fs";

/* ➕ CREATE */
export const createCategory = async (req, res) => {
  try {
    const name = req.body?.name;
    let image = null;

    if (req.file && req.file.path) {
    image = await convertToWebp(req.file.path, "public/uploads/categories");
    }

    const category = await Category.create({ name, image });

    return res.status(201).json({
      status: true,
      message: "Category created",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};


/* 📄 LIST */
export const listCategories = async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;

    const limit = perPage;
    const offset = (page - 1) * limit;

    const { rows, count } = await Category.findAndCountAll({
      where: {
        name: {
          [Op.like]: `%${search}%`,
        },
      },
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    const data = rows.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      status: cat.status,
      image: cat.image,
      full_image_url: getImageUrl(req, "categories", cat.image),
      created_at: cat.created_at,
    }));

    return res.json({
      status: true,
      data,
      pagination: {
        total: count,
        page,
        perPage,
        totalPages: Math.ceil(count / perPage),
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

/* 🔍 GET BY ID */
export const getCategory = async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) {
    return res.status(404).json({ status: false, message: "Category not found" });
  }
  res.json({ status: true, data: category });
};

/* ✏️ UPDATE */
export const updateCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const name = req.body?.name;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        status: false,
        message: "Category not found",
      });
    }

    let image = category.image;

    // 🔄 Replace image
    if (req.file && req.file.path) {
      // ✅ DELETE OLD WEBP IMAGE (CORRECT PATH)
      if (category.image) {
        const oldImagePath = path.join(
          process.cwd(),
          "public",
          "uploads",
          "categories",
          category.image
        );

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath); // 🔥 DELETE OLD IMAGE
        }
      }

      // ✅ SAVE NEW IMAGE
      image = await convertToWebp(
        req.file.path,
        "public/uploads/categories"
      );
    }

    await category.update({ name, image });

    return res.json({
      status: true,
      message: "Category updated",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

/* 🗑 DELETE */
export const deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        status: false,
        message: "Category not found",
      });
    }

    if (category.image) {
      const imagePath = path.join(
        process.cwd(),
        "public",
        "uploads",
        "categories",
        category.image
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await category.destroy();

    return res.json({
      status: true,
      message: "Category deleted",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};