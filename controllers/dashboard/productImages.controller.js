import path from "path";
import ProductImage from "../../models/ProductImage.js";
import { convertToWebp } from "../../utils/webpConverter.js";
import fs from "fs";

export const uploadProductImage = async (req, res) => {
  try {
    const { productId } = req.params;

    // 🔴 SAFETY CHECK
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: false,
        message: "At least one image is required",
      });
    }

    const savedImages = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      const inputPath = file.path;

      const outputDir = path.join(path.dirname(inputPath), "products");

      const webpFileName = await convertToWebp(inputPath, outputDir);

      if (!webpFileName) continue;

      const image = await ProductImage.create({
        product_id: productId,
        image_path: `${webpFileName}`,
        is_primary: i === 0, // ⭐ first image as primary
      });

      savedImages.push(image);
    }

    return res.status(201).json({
      status: true,
      message: "Images uploaded successfully",
      data: savedImages,
    });
  } catch (error) {
    console.error("MULTI IMAGE UPLOAD ERROR:", error);
    return res.status(500).json({
      status: false,
      error: error.message,
    });
  }
};

export const deleteProductImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const image = await ProductImage.findByPk(imageId);

    if (!image) {
      return res.status(404).json({
        status: false,
        message: "Image not found",
      });
    }

    // 🔥 Delete file from disk
    const imagePath = path.join(
      process.cwd(),
      "uploads",
      "products",
      image.image_path
    );

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await image.destroy();

    return res.json({
      status: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("DELETE IMAGE ERROR:", error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const setMainProductImage = async (req, res) => {
  try {
    const { productId } = req.params;
    const { image_id } = req.body;

    if (!image_id) {
      return res.status(400).json({
        status: false,
        message: "Image ID is required",
      });
    }

    // 🔥 Reset all images
    await ProductImage.update(
      { is_primary: false },
      { where: { product_id: productId } }
    );

    // 🔥 Set selected image as primary
    const updated = await ProductImage.update(
      { is_primary: true },
      {
        where: {
          id: image_id,
          product_id: productId,
        },
      }
    );

    if (updated[0] === 0) {
      return res.status(404).json({
        status: false,
        message: "Image not found for product",
      });
    }

    return res.json({
      status: true,
      message: "Primary image updated",
    });
  } catch (error) {
    console.error("SET MAIN IMAGE ERROR:", error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};
