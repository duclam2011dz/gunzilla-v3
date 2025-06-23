import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateAndSendOTP } from "../utils/otp.service.js";

class AuthAPI {
    static async register(req, res) {
        const { username, email, password, retype } = req.body;

        // Kiểm tra thiếu trường
        if (!username || !email || !password || !retype)
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin." });

        // Kiểm tra username
        if (!/^[a-z]{5,10}$/.test(username))
            return res.status(400).json({ message: "Tên tài khoản chỉ gồm a-z, 5-10 ký tự." });

        const usernameExists = await User.findOne({ username });
        if (usernameExists)
            return res.status(400).json({ message: "Tên tài khoản đã tồn tại." });

        // Kiểm tra email
        const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailFormat.test(email))
            return res.status(400).json({ message: "Email không hợp lệ." });

        const emailExists = await User.findOne({ email });
        if (emailExists)
            return res.status(400).json({ message: "Email đã được sử dụng." });

        // Kiểm tra password
        const passwordStrong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        if (!passwordStrong.test(password))
            return res.status(400).json({ message: "Mật khẩu yếu. Phải có ít nhất 8 ký tự, chữ hoa, thường và số." });

        if (password !== retype)
            return res.status(400).json({ message: "Mật khẩu nhập lại không trùng khớp." });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword, isVerified: false });
        await newUser.save();

        // Tạo và gửi mã OTP sau khi tạo user
        await generateAndSendOTP(newUser);

        return res.status(200).json({
            message: "Tài khoản đã được tạo. Hãy xác thực OTP để hoàn tất đăng ký.",
            emailSent: true
        });
    } catch(err) {
        res.status(500).json({ message: "Lỗi server." });
    }

    static async login(req, res) {
        const { username, password } = req.body;
        try {
            const user = await User.findOne({ username });
            if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản!" });

            const match = await bcrypt.compare(password, user.password);
            if (!match) return res.status(401).json({ message: "Sai mật khẩu!" });

            if (user.isOnline) {
                return res.status(403).json({ message: "Tài khoản này đang được sử dụng ở một nơi khác!" });
            }

            if (!user.isVerified) {
                return res.status(403).json({ message: "Tài khoản chưa xác thực OTP!" });
            }

            await User.updateOne({ _id: user._id }, { isOnline: true });
            res.status(200).json({ message: "Đăng nhập thành công!", email: user.email });
        } catch (err) {
            res.status(500).json({ message: "Lỗi server." });
        }
    }

    static async verifyOTP(req, res) {
        const { username, otp } = req.body;
        const user = await User.findOne({ username });

        if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });
        if (user.isVerified) return res.status(400).json({ message: "Tài khoản đã xác thực rồi" });
        if (!user.otpToken || !user.otpExpires) return res.status(400).json({ message: "Không có OTP hợp lệ" });
        if (user.otpExpires < new Date()) return res.status(400).json({ message: "OTP đã hết hạn" });

        if (otp !== user.otpToken) {
            return res.status(400).json({ message: "Mã OTP không đúng" });
        }

        user.isVerified = true;
        user.otpToken = undefined;
        user.otpExpires = undefined;
        await user.save();

        return res.status(200).json({ message: "Xác thực thành công!" });
    }

    static async resendOTP(req, res) {
        const { username } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });
        if (user.isVerified) return res.status(400).json({ message: "Tài khoản đã xác thực rồi" });

        await generateAndSendOTP(user);
        return res.status(200).json({ message: "Đã gửi lại mã OTP mới!" });
    }

    static async getProfile(req, res) {
        const { username } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
        res.json({ country: user.country });
    }

    static async updateFlag(req, res) {
        const { username, country } = req.body;
        await User.updateOne({ username }, { country });
        res.json({ message: "Đã cập nhật quốc tịch!" });
    }
}

export default AuthAPI;