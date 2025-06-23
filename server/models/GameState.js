import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
    id: String,
    nickname: String,
    x: Number,
    y: Number,
});

const gameStateSchema = new mongoose.Schema({
    createdAt: { type: Date, default: Date.now },
    players: [playerSchema],
});

const GameState = mongoose.model("GameState", gameStateSchema);
export default GameState;