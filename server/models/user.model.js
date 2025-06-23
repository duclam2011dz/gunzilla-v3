import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isOnline: { type: Boolean, default: false },
    skin: { type: String, default: "lime" },
    ownedSkins: { type: [String], default: [] },
    isVerified: { type: Boolean, default: false },
    otpToken: { type: String },
    otpExpires: { type: Date },
    country: { type: String, default: "vn" }
});

export default mongoose.model("User", UserSchema);