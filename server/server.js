import express from "express";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import dotenv from "dotenv";
import mongoose from "mongoose";
import gameRoutes from "./routes/game.routes.js";
import GameAPI from "./api/game.api.js";
import Logger from "./utils/logger.js";
import authRoutes from "./routes/auth.routes.js";
import shopRoutes from "./routes/shop.routes.js";

// Load env variables
dotenv.config();

// ===== Class AppServer: Khởi tạo express + socket.io =====
class AppServer {
    constructor() {
        this.app = express();
        this.httpServer = createServer(this.app);
        this.io = new SocketServer(this.httpServer);
        this.port = process.env.PORT || 3000;
        this.logger = new Logger("AppServer");

        this.middlewares();
        this.routes();
        this.initSocketServer();
        this.connectMongoDB();
    }

    middlewares() {
        this.app.use(express.json());
        this.app.use(express.static("public"));
        this.app.use("/api/shop", shopRoutes);
    }

    routes() {
        this.app.use("/api/game", gameRoutes);
        this.app.use("/api/auth", authRoutes);

        // ✅ Mặc định hiển thị game.html khi vào "/"
        this.app.get("/", (req, res) => {
            res.sendFile("templates/auth.html", { root: "public" });
        });
    }

    initSocketServer() {
        this.io.on("connection", (socket) => {
            this.logger.info(`Player connected: ${socket.id}`);
            GameAPI.handleNewConnection(socket, this.io);
            setInterval(() => {
                GameAPI.gameLoop(this.io);
            }, 1000 / 30);
        });
    }

    async connectMongoDB() {
        try {
            await mongoose.connect(process.env.MONGO_URI);
            this.logger.success("Connected to MongoDB Atlas");
        } catch (error) {
            this.logger.error("MongoDB connection failed: ", error);
        }
    }

    start() {
        this.httpServer.listen(this.port, () => {
            this.logger.success(`Gunzilla Server running at http://localhost:${this.port}`);
        });
    }
}

// ===== Khởi chạy server =====
const server = new AppServer();
server.start();