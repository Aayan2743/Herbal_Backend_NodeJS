import ProductVariation from "../../models/ProductVariation.js";
import ProductVariationValue from "../../models/ProductVariationValue.js";

/* ---------------- CREATE VARIATION ---------------- */
export const createVariation = async (req, res) => {
  const { name, type } = req.body;

  const variation = await ProductVariation.create({ name, type });

  return res.json({ status: true, data: variation });
};

/* ---------------- GET ALL ---------------- */
export const getVariations = async (req, res) => {
  const variations = await ProductVariation.findAll({
    include: {
      model: ProductVariationValue,
      as: "variation_values",
    },
  });

  res.json({ status: true, data: variations });
};

/* ---------------- UPDATE VARIATION ---------------- */
export const updateVariation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;

    const variation = await ProductVariation.findByPk(id);
    if (!variation) {
      return res.status(404).json({
        status: false,
        message: "Variation not found",
      });
    }

    if (name !== undefined) variation.name = name;
    if (type !== undefined) variation.type = type;

    await variation.save();

    return res.json({
      status: true,
      message: "Variation updated successfully",
      data: variation,
    });
  } catch (error) {
    console.error("updateVariation error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

/* ---------------- DELETE VARIATION ---------------- */
export const deleteVariation = async (req, res) => {
  await ProductVariation.destroy({ where: { id: req.params.id } });
  res.json({ status: true, message: "Deleted" });
};

/* ---------------- ADD VALUE ---------------- */
export const addVariationValue = async (req, res) => {
  const { variationId } = req.params;
  const { value, color_code } = req.body;

  const data = await ProductVariationValue.create({
    variation_id: variationId,
    value,
    color_code,
  });

  res.json({ status: true, data });
};

export const updateVariationValue = async (req, res) => {
  try {
    const { id } = req.params; // variation value ID
    const { value, color_code } = req.body;

    const variationValue = await ProductVariationValue.findByPk(id);

    if (!variationValue) {
      return res.status(404).json({
        status: false,
        message: "Variation value not found",
      });
    }

    await variationValue.update({
      value,
      color_code,
    });

    res.json({
      status: true,
      message: "Variation value updated successfully",
      data: variationValue,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

/* ---------------- DELETE VALUE ---------------- */
export const deleteVariationValue = async (req, res) => {
  await ProductVariationValue.destroy({ where: { id: req.params.valueId } });
  res.json({ status: true, message: "Value deleted" });
};
