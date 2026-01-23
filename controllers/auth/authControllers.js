import { body, validationResult } from "express-validator";
import User from "../../models/user.js";

import { sendMessage } from "../../helpers/360messanger.js";

import crypto from "crypto";

import { generateToken } from "../../lib/jwt.js";
import fs from "fs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Op } from "sequelize";
import Otp from "../../models/Otp.js";
import { convertToWebp } from "../../utils/webpConverter.js";
import { getImageUrl } from "../../utils/getFullUrl.js";

dotenv.config();

function generateDummyEmail(phone) {
  return `otp_${phone}_${Date.now()}@gmail.com`;
}

async function encryptPhoneAsPassword(phone) {
  const hashPassword = await bcrypt.hash(phone, 10);
  return hashPassword;
}

export const register = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.array()[0].msg,
    });
  }

  const { name, email, phone, password } = req.body;

  try {
    // Check email exists
    const emailExist = await User.findOne({ where: { email } });
    if (emailExist) {
      return res.status(200).json({
        status: false,
        message: "Email already exists",
      });
    }

    // Check phone exists
    const phoneExist = await User.findOne({ where: { phone } });
    if (phoneExist) {
      return res.status(200).json({
        status: false,
        message: "Phone number already exists",
      });
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create user
    const addUser = await User.create({
      name,
      email,
      phone,
      password: hashPassword,
      role: "user",
    });

    // 🔐 GENERATE JWT TOKEN (🔥 IMPORTANT)
    const token = jwt.sign(
      {
        id: addUser.id,
        role: addUser.role,
      },
      process.env.JWTWEB_KEY,
      { expiresIn: "7d" },
    );

    // ✅ RETURN TOKEN + USER
    return res.status(201).json({
      status: true,
      message: "User registered successfully",
      token,
      user: {
        id: addUser.id,
        name: addUser.name,
        email: addUser.email,
        phone: addUser.phone,
        role: addUser.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const userlogin = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.array()[0].msg,
    });
  }

  const { username, password } = req.body;

  try {
    // Find only USER role
    const user = await User.findOne({
      where: {
        role: "user",
        [Op.or]: [{ email: username }, { phone: username }],
      },
    });

    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Invalid username / phone number",
      });
    }

    // Password check
    const passwordCheck = await bcrypt.compare(password, user.password);

    if (!passwordCheck) {
      return res.status(401).json({
        status: false,
        message: "Invalid credentials",
      });
    }

    // JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWTWEB_KEY,
      { expiresIn: "1d" },
    );

    return res.status(200).json({
      status: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const adminlogin = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.array()[0].msg,
    });
  }

  const { username, password } = req.body;

  try {
    // Find only USER role
    const user = await User.findOne({
      where: {
        role: "admin",
        [Op.or]: [{ email: username }, { phone: username }],
      },
    });

    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Invalid username / phone number",
      });
    }

    // Password check
    const passwordCheck = await bcrypt.compare(password, user.password);

    if (!passwordCheck) {
      return res.status(401).json({
        status: false,
        message: "Invalid credentials",
      });
    }

    // JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWTWEB_KEY,
      { expiresIn: "1d" },
    );

    return res.status(200).json({
      status: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const profile = async (req, res) => {
  try {
    const userId = req.users.id;

    // Fetch user from DB
    const user = await User.findOne({
      where: { id: userId },
      attributes: ["id", "name", "email"], // choose fields to return
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Profile error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Phone is required" });
    }

    // Rate limit: max 5 OTPs in last 5 minutes
    const recentCount = await Otp.count({
      where: {
        phone,
        created_at: {
          [Op.gte]: new Date(Date.now() - 5 * 60 * 1000),
        },
      },
    });

    if (recentCount >= 5) {
      return res.status(429).json({ message: "Too many OTP requests" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Invalidate old OTPs
    await Otp.update({ is_used: true }, { where: { phone } });

    await Otp.create({
      phone,
      otp,
      expires_at: expiresAt,
    });

    const message = `Your OTP is ${otp}. Valid for 5 minutes.`;

    sendMessage(phone, message, "", null, (err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to send OTP" });
      }
      return res.json({ success: true, message: "OTP sent successfully" });
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * VERIFY OTP (LOGIN + REGISTER)
 */

export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp, name } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP required" });
    }

    const record = await Otp.findOne({
      where: { phone, otp, is_used: false },
      order: [["id", "DESC"]],
    });

    if (!record) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    if (new Date() > new Date(record.expires_at)) {
      return res.status(401).json({ message: "OTP expired" });
    }

    await record.update({ is_used: true });

    const encryptedPassword = await encryptPhoneAsPassword(phone);

    let user = await User.findOne({ where: { phone } });

    if (!user) {
      user = await User.create({
        phone,
        name: name || "Guest",
        email: generateDummyEmail(phone),
        password: encryptedPassword,
      });
    }

    const token = generateToken(user);

    // 🔥 GET ALL USERS
    const users = await User.findOne({
      where: { phone },
      attributes: ["id", "name", "email", "phone", "role", "avatar"],
    });

    return res.json({
      success: true,
      token,
      user: users,
      // users: allUsers,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.users.id;
    const { name, email } = req.body;

    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    let avatar = user.avatar;

    /* ===== IMAGE UPLOAD ===== */
    if (req.file) {
      const uploadDir = "uploads/profile";

      const webpFileName = await convertToWebp(req.file.path, uploadDir);

      // Delete old avatar
      if (user.avatar) {
        const oldPath = `uploads/profile/${user.avatar}`;
        if (fs.existsSync(oldPath)) {
          fs.unlink(oldPath, () => {});
        }
      }

      avatar = webpFileName;
    }

    /* ===== UPDATE USER ===== */
    await user.update({
      name: name || user.name,
      email: email || user.email,
      avatar: avatar,
    });

    return res.status(200).json({
      status: true,
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        // avatar: user.avatar, // ✅ correct
        avatar: getImageUrl(req, "profile", user.avatar),
      },
    });
  } catch (error) {
    console.error("Profile Update Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.users.id;
    const { current_password, new_password, confirm_new_password } = req.body;

    if (!current_password || !new_password || !confirm_new_password) {
      return res.status(400).json({
        status: false,
        message: "All fields are required",
      });
    }

    if (new_password !== confirm_new_password) {
      return res.status(400).json({
        status: false,
        message: "Passwords do not match",
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        status: false,
        message: "Password must be at least 6 characters",
      });
    }

    // ✅ Sequelize way
    const user = await User.findOne({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(current_password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        status: false,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await user.update({
      password: hashedPassword,
    });

    return res.status(200).json({
      status: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};
