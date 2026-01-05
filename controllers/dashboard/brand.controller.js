import fs from "fs";
import path from "path";
import { Op } from "sequelize";


import Brand from "../../models/Brand.js";
import { convertToWebp } from "../../utils/webpConverter.js";
import { getImageUrl } from "../../utils/getFullUrl.js";

/* ➕ CREATE BRAND */
export const createBrand = async (req, res) => {
  try {
    const name = req.body?.name;
    if (!name) {
      return res.status(422).json({ status: false, message: "Name is required" });
    }

    let image = null;
    if (req.file && req.file.path) {
      image = await convertToWebp(req.file.path, "public/uploads/brands");
    }

    const brand = await Brand.create({ name, image });

    return res.status(201).json({
      status: true,
      message: "Brand created",
      data: brand,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

/* 📄 LIST BRANDS (SEARCH + PAGINATION) */
export const listBrands = async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;

    const limit = perPage;
    const offset = (page - 1) * limit;

    const { rows, count } = await Brand.findAndCountAll({
      where: {
        name: { [Op.like]: `%${search}%` },
      },
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    const data = rows.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      status: b.status,
      image: b.image,
      full_image_url: getImageUrl(req, "brands", b.image),
      created_at: b.created_at,
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
    return res.status(500).json({ status: false, message: error.message });
  }
};

/* 🔍 GET BRAND */
export const getBrand = async (req, res) => {
  const brand = await Brand.findByPk(req.params.id);
  if (!brand) {
    return res.status(404).json({ status: false, message: "Brand not found" });
  }

  res.json({
    status: true,
    data: {
      ...brand.toJSON(),
      full_image_url: getImageUrl(req, "brands", brand.image),
    },
  });
};

/* ✏️ UPDATE BRAND */
export const updateBrand = async (req, res) => {
  try {
    const id = req.params.id;
    const name = req.body?.name;

    const brand = await Brand.findByPk(id);
    if (!brand) {
      return res.status(404).json({ status: false, message: "Brand not found" });
    }

    let image = brand.image;

    if (req.file && req.file.path) {
      // delete old image
      if (brand.image) {
        const oldPath = path.join(
          process.cwd(),
          "public/uploads/brands",
          brand.image
        );
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      image = await convertToWebp(req.file.path, "public/uploads/brands");
    }

    await brand.update({ name, image });

    return res.json({ status: true, message: "Brand updated" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

/* 🗑 DELETE BRAND */
export const deleteBrand = async (req, res) => {
  const brand = await Brand.findByPk(req.params.id);
  if (!brand) {
    return res.status(404).json({ status: false, message: "Brand not found" });
  }

  if (brand.image) {
    const imgPath = path.join(
      process.cwd(),
      "public/uploads/brands",
      brand.image
    );
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }

  await brand.destroy();

  res.json({ status: true, message: "Brand deleted" });
};
