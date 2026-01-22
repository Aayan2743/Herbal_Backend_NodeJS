import crypto from "crypto";
import Otp from "../models/Otp.js";
import { sendMessage } from "../helpers/360messanger.js";

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

export async function sendOTP(phone) {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Invalidate old OTPs
  await Otp.update({ is_used: true }, { where: { phone } });

  await Otp.create({
    phone,
    otp,
    expires_at: expiresAt,
  });

  const message = `Your OTP is ${otp}. Valid for 5 minutes.`;

  await new Promise((resolve, reject) => {
    sendMessage(phone, message, "", null, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  return { success: true, message: "OTP sent successfully" };
}

export async function verifyOTP(phone, otp) {
  const record = await Otp.findOne({
    where: {
      phone,
      otp,
      is_used: false,
    },
    order: [["id", "DESC"]],
  });

  if (!record) {
    return { success: false, message: "Invalid OTP" };
  }

  if (new Date() > new Date(record.expires_at)) {
    return { success: false, message: "OTP expired" };
  }

  await record.update({ is_used: true });

  return { success: true, message: "OTP verified successfully" };
}
