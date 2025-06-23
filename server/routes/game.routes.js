import express from "express";
import GameAPI from "../api/game.api.js";

const router = express.Router();

// Cấu trúc API đơn giản tạm thời, để dùng về sau
router.get("/status", (req, res) => {
    res.json({ online: true, players: GameAPI.getPlayerCount() });
});

export default router;