// import { Address } from "../models/index.js";

import Address from "../../models/Address.js";

/* ================= CREATE ADDRESS ================= */
export const createAddress = async (req, res) => {
  try {
    const userId = req.users.id;

    const { name, phone, address, city, state, country, pincode, is_default } =
      req.body;

    if (!name || !phone || !address || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // If default → unset previous defaults
    if (is_default) {
      await Address.update(
        { is_default: false },
        { where: { user_id: userId } }
      );
    }

    const newAddress = await Address.create({
      user_id: userId,
      name,
      phone,
      address,
      city,
      state,
      country,
      pincode,
      is_default: is_default || false,
    });

    res.json({
      success: true,
      message: "Address added successfully",
      data: newAddress,
    });
  } catch (err) {
    console.error("CREATE ADDRESS ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= GET ALL ADDRESSES ================= */
export const getAddresses = async (req, res) => {
  try {
    const userId = req.users.id;

    const addresses = await Address.findAll({
      where: { user_id: userId },
      order: [
        ["is_default", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    res.json({ success: true, data: addresses });
  } catch (err) {
    console.error("FETCH ADDRESS ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= UPDATE ADDRESS ================= */
export const updateAddress = async (req, res) => {
  try {
    const userId = req.users.id;
    const { id } = req.params;

    const address = await Address.findOne({
      where: { id, user_id: userId },
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    if (req.body.is_default) {
      await Address.update(
        { is_default: false },
        { where: { user_id: userId } }
      );
    }

    await address.update(req.body);

    res.json({
      success: true,
      message: "Address updated successfully",
      data: address,
    });
  } catch (err) {
    console.error("UPDATE ADDRESS ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= DELETE ADDRESS ================= */
export const deleteAddress = async (req, res) => {
  try {
    const userId = req.users.id;
    const { id } = req.params;

    const deleted = await Address.destroy({
      where: { id, user_id: userId },
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (err) {
    console.error("DELETE ADDRESS ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
