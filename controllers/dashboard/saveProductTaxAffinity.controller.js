import ProductTaxAffinity from "../../models/ProductTaxAffinity.js";

export const saveProductTaxAffinity = async (req, res) => {
  try {
    const { productId } = req.params;

    const {
      gst_enabled,
      gst_type,
      gst_percent,
      affinity_enabled,
      affinity_percent,
    } = req.body;

    const data = await ProductTaxAffinity.upsert({
      product_id: productId,
      gst_enabled,
      gst_type,
      gst_percent,
      affinity_enabled,
      affinity_percent,
    });

    res.json({
      status: true,
      message: "Tax & affinity saved",
      data,
    });
  } catch (err) {
    console.error("TAX SAVE ERROR:", err);
    res.status(500).json({
      status: false,
      error: err.message,
    });
  }
};
