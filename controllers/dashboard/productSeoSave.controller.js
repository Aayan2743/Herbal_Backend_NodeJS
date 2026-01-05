import ProductSeoMeta from "../../models/ProductSeoMeta.js";

export const saveProductSeo = async (req, res) => {
  try {
    const { productId } = req.params;
    const { meta_title, meta_description, meta_tags } = req.body;

    const seo = await ProductSeoMeta.upsert({
      product_id: productId,
      meta_title,
      meta_description,
      meta_tags: Array.isArray(meta_tags) ? meta_tags.join(",") : meta_tags,
    });

    res.json({
      status: true,
      message: "SEO meta saved successfully",
      data: seo,
    });
  } catch (err) {
    console.error("SEO SAVE ERROR:", err);
    res.status(500).json({
      status: false,
      error: err.message,
    });
  }
};
