import ProductVariantCombination from "../../models/ProductVariantCombination.js";
import ProductVariantCombinationValue from "../../models/ProductVariantCombinationValue.js";

import path from "path";
import ProductVariantImage from "../../models/ProductVariantImage.js";
import { convertToWebp } from "../../utils/webpConverter.js";

export const saveProductVariants = async (req, res) => {
  const { productId } = req.params;
  const { variants } = req.body;

  if (!variants || !Array.isArray(variants)) {
    return res.status(400).json({
      status: false,
      message: "Variants data required",
    });
  }

  try {
    const createdVariants = [];

    for (const variant of variants) {
      const { variation_value_ids, sku, extra_price, quantity, low_quantity } =
        variant;

      // 1️⃣ CREATE VARIANT COMBINATION
      const combination = await ProductVariantCombination.create({
        product_id: productId,
        sku,
        extra_price,
        quantity,
        low_quantity,
      });

      // 2️⃣ MAP VARIATION VALUES
      const rows = variation_value_ids.map((valueId) => ({
        variant_combination_id: combination.id,
        variation_value_id: valueId,
      }));

      await ProductVariantCombinationValue.bulkCreate(rows);

      createdVariants.push(combination);
    }

    return res.status(201).json({
      status: true,
      message: "Variants saved successfully",
      data: createdVariants,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message,
    });
  }
};

export const uploadVariantImages = async (req, res) => {
  try {
    const { variantCombinationId } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: false,
        message: "At least one image is required",
      });
    }

    const savedImages = [];

    for (const file of req.files) {
      const inputPath = file.path;
      const outputDir = path.join(path.dirname(inputPath), "variants");

      const webpName = await convertToWebp(inputPath, outputDir);

      const image = await ProductVariantImage.create({
        variant_combination_id: variantCombinationId,
        image_path: `${webpName}`,
      });

      savedImages.push(image);
    }

    return res.status(201).json({
      status: true,
      message: "Variant images uploaded",
      data: savedImages,
    });
  } catch (err) {
    console.error("VARIANT IMAGE ERROR:", err);
    res.status(500).json({
      status: false,
      error: err.message,
    });
  }
};
