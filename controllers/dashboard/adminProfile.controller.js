
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/user.js";
import path from "path";
import fs from "fs";
import { convertToWebp } from "../../utils/webpConverter.js";
import { getImageUrl } from "../../utils/getFullUrl.js";


// export const getAdminProfile = async (req, res) => {
//   try {
//     const userId = req.users.id || req.users.userId;

//     const user = await User.findByPk(userId, {
//       attributes: { exclude: ["password"] },
//     });

//     if (!user) {
//       return res.status(404).json({
//         status: false,
//         message: "User not found",
//       });
//     }

//     if (user.role !== "admin") {
//       return res.status(403).json({
//         status: false,
//         message: "Admin access only",
//       });
//     }

//     return res.json({
//       status: true,
//       data: user,
//     });
//   } catch (error) {
//     console.error("getAdminProfile error:", error);
//     return res.status(500).json({
//       status: false,
//       message: "Server error",
//     });
//   }
// };



export const getAdminProfile = async (req, res) => {
  try {
    const userId = req.users.id || req.users.userId;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        status: false,
        message: "Admin access only",
      });
    }

    /* ---------------- FORMAT AVATAR URL ---------------- */
    let avatarUrl = null;

    if (user.avatar) {
      // user.avatar example: /uploads/profiles/169999999.webp
      const parts = user.avatar.split("/");

      const folder = parts[2];    // profiles
      const filename = parts[3];  // 169999999.webp

      avatarUrl = getImageUrl(req, folder, filename);
    }

    return res.json({
      status: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: avatarUrl, // ✅ FULL URL
      },
    });
  } catch (error) {
    console.error("getAdminProfile error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};
/* UPDATE ADMIN PROFILE */
export const updateAdminProfile = async (req, res) => {
  try {
    const userId = req.users.id || req.users.userId;
    const { name, email, phone, password } = req.body || {};

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        status: false,
        message: "Admin access only",
      });
    }

    /* ---------------- TEXT FIELDS ---------------- */
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    /* ---------------- IMAGE (FLEXIBLE HANDLING) ---------------- */
    // ✅ Support both multer.single and multer.fields/any
 

      const uploadedFile =
        req.file ||
        (req.files?.avatar && req.files.avatar[0]) ||
        null;

    if (uploadedFile) {
      // 1️⃣ Delete old avatar if exists
      if (user.avatar) {
        const oldPath = path.join(
          "public",
          user.avatar.replace("/uploads/", "uploads/")
        );

        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      // 2️⃣ Convert new image to WEBP
      const newImage = await convertToWebp(
        uploadedFile.path,
        "public/uploads/profiles"
      );

      // 3️⃣ Save new path
      user.avatar = `/uploads/profiles/${newImage}`;
    }

    /* ---------------- PASSWORD ---------------- */
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    return res.json({
      status: true,
      message: "Profile updated successfully",
      data: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("updateAdminProfile error:", error);
    return res.status(500).json({
      status: false,
      message: "Update failed",
    });
  }
};