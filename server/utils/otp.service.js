import { randomInt } from "crypto";
import User from "../models/user.model.js";
import { sendOTPEmail } from "./mailer.js";

export async function generateAndSendOTP(user) {
    const otp = String(randomInt(100000, 999999)); // 6 chữ số
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    user.otpToken = otp;
    user.otpExpires = expiresAt;
    await user.save();

    await sendOTPEmail(user.email, otp);
}