import PaymentGateway from "../../models/PaymentGateway.js";

/* ---------------- GET PAYMENT SETTINGS ---------------- */
export const getPaymentGateways = async (req, res) => {
  try {
    let settings = await PaymentGateway.findOne();

    if (!settings) {
      settings = await PaymentGateway.create({});
    }

    return res.json({
      status: true,
      data: settings,
    });
  } catch (error) {
    console.error("getPaymentGateways error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

/* ---------------- UPDATE PAYMENT SETTINGS ---------------- */
export const updatePaymentGateways = async (req, res) => {
  try {
    let settings = await PaymentGateway.findOne();

    if (!settings) {
      settings = await PaymentGateway.create({});
    }

    Object.assign(settings, req.body);

    await settings.save();

    return res.json({
      status: true,
      message: "Payment gateway settings updated",
      data: settings,
    });
  } catch (error) {
    console.error("updatePaymentGateways error:", error);
    return res.status(500).json({
      status: false,
      message: "Update failed",
    });
  }
};
