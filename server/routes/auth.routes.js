import express from "express";
import AuthAPI from "../api/auth.api.js";
import User from "../models/user.model.js";

const router = express.Router();

router.post("/login", AuthAPI.login);
router.post("/register", AuthAPI.register);
router.post("/verify", AuthAPI.verifyOTP);
router.post("/resend-otp", AuthAPI.resendOTP);
router.post("/getprofile", AuthAPI.getProfile);
router.post("/update-flag", AuthAPI.updateFlag);

router.post("/logout", async (req, res) => {
    const username = req.body?.username;

    if (!username) {
        return res.status(400).json({ message: "Thiếu username trong body!" });
    }

    await User.updateOne({ username }, { isOnline: false });
    return res.status(200).json({ message: "Logout thành công!" });
});

router.post("/skin", async (req, res) => {
    const { username, skin } = req.body;
    if (!username || !skin) return res.status(400).json({ message: "Thiếu dữ liệu" });

    await User.updateOne({ username }, { skin });
    res.status(200).json({ message: "Cập nhật skin thành công!" });
});

router.post("/getskin", async (req, res) => {
    const { username } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });

    res.status(200).json({ skin: user.skin || "lime" });
});

router.post("/unlock-skin", async (req, res) => {
    const { username, skin } = req.body;
    if (!username || !skin) return res.status(400).json({ message: "Thiếu thông tin" });

    await User.updateOne(
        { username },
        { $addToSet: { ownedSkins: skin } }
    );

    res.status(200).json({ message: "Cập nhật skin VIP thành công" });
});

router.post("/get-skins", async (req, res) => {
    const { username } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });

    res.status(200).json({ vipSkins: user.ownedSkins || [] });
});

export default router;