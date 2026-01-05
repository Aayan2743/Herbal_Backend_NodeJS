import ApplicationSetting from "../../models/ApplicationSetting.js";
import fs from "fs";
import path from "path";
import { convertToWebp } from "../../utils/webpConverter.js";
import { getImageUrl } from "../../utils/getFullUrl.js";



/* ---------------- GET SETTINGS ---------------- */
export const getAppSettings = async (req, res) => {
  try {
    let settings = await ApplicationSetting.findOne();

    if (!settings) {
      settings = await ApplicationSetting.create({
        app_name: "My Application",
      });
    }

    /* -------- FORMAT LOGO -------- */
    let logoUrl = null;
    if (settings.logo) {
      // /uploads/logo/17000001.webp
      const [, , folder, filename] = settings.logo.split("/");
      logoUrl = getImageUrl(req, folder, filename);
    }

    /* -------- FORMAT FAVICON -------- */
    let faviconUrl = null;
    if (settings.favicon) {
      // /uploads/favicon/17000002.webp
      const [, , folder, filename] = settings.favicon.split("/");
      faviconUrl = getImageUrl(req, folder, filename);
    }

    return res.json({
      status: true,
      data: {
        id: settings.id,
        app_name: settings.app_name,
        logo: logoUrl,
        favicon: faviconUrl,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (error) {
    console.error("getAppSettings error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

/* ---------------- UPDATE SETTINGS ---------------- */
export const updateAppSettings = async (req, res) => {
  try {
    const { app_name } = req.body || {};

    let settings = await ApplicationSetting.findOne();

    if (!settings) {
      settings = await ApplicationSetting.create({
        app_name: app_name || "My Application",
      });
    }

    if (app_name) settings.app_name = app_name;

    /* ------------ LOGO ------------ */
    if (req.files?.logo?.[0]) {
      if (settings.logo) {
        const oldPath = path.join("public", settings.logo);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      const logo = await convertToWebp(
        req.files.logo[0].path,
        "public/uploads/logo"
      );

      settings.logo = `/uploads/logo/${logo}`;
    }

    /* ------------ FAVICON ------------ */
    if (req.files?.favicon?.[0]) {
      if (settings.favicon) {
        const oldPath = path.join("public", settings.favicon);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      const favicon = await convertToWebp(
        req.files.favicon[0].path,
        "public/uploads/favicon"
      );

      settings.favicon = `/uploads/favicon/${favicon}`;
    }

    await settings.save();

    return res.json({
      status: true,
      message: "Application settings updated",
      data: settings,
    });
  } catch (error) {
    console.error("updateAppSettings error:", error);
    res.status(500).json({
      status: false,
      message: "Update failed",
    });
  }
};
