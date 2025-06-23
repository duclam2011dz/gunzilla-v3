import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // 💥 bỏ chặn chứng chỉ tự ký
    }
});

export async function sendBanWarning(toEmail, reason) {
    const mailOptions = {
        from: `"Gunzilla Game" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "⚠️ Cảnh báo gian lận trong Gunzilla",
        html: `<p>Chúng tôi phát hiện tài khoản của bạn có dấu hiệu vi phạm: <b>${reason}</b>.</p>
               <p>Sau 3 lần vi phạm, tài khoản sẽ bị tạm cấm truy cập vào game.</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Đã gửi cảnh báo đến ${toEmail}`);
    } catch (err) {
        console.error("[EMAIL ERROR]", err);
    }
}

export async function sendOTPEmail(toEmail, otp) {
    const mailOptions = {
        from: `"Gunzilla" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "🔐 Mã xác thực tài khoản Gunzilla",
        html: `<p>Mã OTP của bạn là: <b style="font-size:18px;">${otp}</b></p>
               <p>Mã này có hiệu lực trong vòng <b>5 phút</b>. Đừng chia sẻ mã này cho bất kỳ ai.</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Gửi mã OTP ${otp} đến ${toEmail}`);
    } catch (err) {
        console.error("[EMAIL ERROR]", err);
    }
}