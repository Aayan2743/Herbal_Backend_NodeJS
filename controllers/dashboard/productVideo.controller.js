import ProductVideo from "../../models/ProductVideo.js";

export const saveProductVideo = async (req, res) => {
  try {
    const { productId } = req.params;
    const { video_url } = req.body;

    // upsert → add or update
    const [video] = await ProductVideo.upsert({
      product_id: productId,
      video_url,
    });

    return res.json({
      status: true,
      message: "Product video saved successfully",
      data: video,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message,
    });
  }
};
