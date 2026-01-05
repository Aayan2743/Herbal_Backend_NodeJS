import SocialMediaSetting from "../../models/SocialMediaSetting.js";

/* ---------------- GET SOCIAL MEDIA ---------------- */
export const getSocialMediaSettings = async (req, res) => {
  try {
    let settings = await SocialMediaSetting.findOne();

    if (!settings) {
      settings = await SocialMediaSetting.create({});
    }

    return res.json({
      status: true,
      data: settings,
    });
  } catch (error) {
    console.error("getSocialMediaSettings error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

/* ---------------- UPDATE SOCIAL MEDIA ---------------- */
export const updateSocialMediaSettings = async (req, res) => {
  try {
    const {
      linkedin,
      dribbble,
      instagram,
      twitter,
      youtube,
    } = req.body || {};

    let settings = await SocialMediaSetting.findOne();

    if (!settings) {
      settings = await SocialMediaSetting.create({});
    }

    if (linkedin !== undefined) settings.linkedin = linkedin;
    if (dribbble !== undefined) settings.dribbble = dribbble;
    if (instagram !== undefined) settings.instagram = instagram;
    if (twitter !== undefined) settings.twitter = twitter;
    if (youtube !== undefined) settings.youtube = youtube;

    await settings.save();

    return res.json({
      status: true,
      message: "Social media settings updated",
      data: settings,
    });
  } catch (error) {
    console.error("updateSocialMediaSettings error:", error);
    return res.status(500).json({
      status: false,
      message: "Update failed",
    });
  }
};
