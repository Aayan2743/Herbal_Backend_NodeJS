import { body, validationResult } from "express-validator";
import User from "../../models/user.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Op } from "sequelize";

dotenv.config();

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
      return res
        .status(200)
        .json({ status: false, message: "Email already exists" });
    }

    // Check phone exists
    const phoneExist = await User.findOne({ where: { phone } });
    if (phoneExist) {
      return res
        .status(200)
        .json({ status: false, message: "Phone number already exists" });
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create user (role auto = user)
    const addUser = await User.create({
      name,
      email,
      phone,
      password: hashPassword,
    });

    return res.status(201).json({
      status: true,
      message: "User registered successfully",
      data: {
        id: addUser.id,
        name: addUser.name,
        email: addUser.email,
        phone: addUser.phone,
        role: addUser.role, // will be "user"
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
      { expiresIn: "1d" }
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
      { expiresIn: "1d" }
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
