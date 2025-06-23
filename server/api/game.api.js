import User from "../models/user.model.js";
import { SkinBuffs } from "../utils/skinBuffs.js";
import AntiCheat from "../utils/antiCheat.js";

class GameAPI {
    static players = {};
    static bullets = [];
    static mapWidth = 2000;
    static mapHeight = 2000;

    static handleNewConnection(socket, io) {
        socket.on("update_position", (data) => {
            const player = this.players[socket.id];
            if (!player) return;

            let speed = 5;
            if (player.slow) {
                speed *= player.slow.factor;
            }

            let { dirX = 0, dirY = 0 } = data;
            const length = Math.sqrt(dirX * dirX + dirY * dirY) || 1;

            dirX /= length;
            dirY /= length;

            const deltaX = dirX * speed;
            const deltaY = dirY * speed;

            const isSpeedHack = AntiCheat.checkSpeedHack(
                socket.id,
                dirX,
                dirY,
                deltaX,
                deltaY,
                speed
            );

            if (isSpeedHack) {
                AntiCheat.registerViolation(socket, "Speedhack");
                return;
            }

            player.x += deltaX;
            player.y += deltaY;

            // Giới hạn trong map
            player.x = Math.max(0, Math.min(player.x, this.mapWidth));
            player.y = Math.max(0, Math.min(player.y, this.mapHeight));

            io.emit("players_update", this.players);
        });

        socket.on("set_user_info", async ({ username, email }, callback) => {
            const user = await User.findOne({ username });
            socket.user = { username, email, country: user?.country || "vn" };
            console.log(`[SOCKET INFO] Gán user ${username} - ${email} cho ${socket.id}`);
            if (callback) callback();
        });

        socket.on("shoot", (bullet) => {
            const isCheating = AntiCheat.registerShoot(socket.id);

            if (isCheating) {
                AntiCheat.registerViolation(socket, "Auto-shoot");
                return;
            }

            bullet.owner = socket.id;
            bullet.lifetime = 0;
            GameAPI.bullets.push(bullet);
        });

        socket.on("set_nickname", ({ nickname, username, skin }) => {
            const duplicate = Object.values(this.players).some(
                (p) => p.nickname.toLowerCase() === nickname.toLowerCase()
            );

            if (duplicate) {
                socket.emit("nickname_taken");
                return;
            }

            const skinBuff = SkinBuffs[skin] || {};
            const baseHp = 100;
            const hp = baseHp + Math.floor((skinBuff.hpBonus || 0) * baseHp);

            this.players[socket.id] = {
                id: socket.id,
                nickname,
                username,
                skin: skin || "lime",
                x: Math.random() * (this.mapWidth - 100) + 50,
                y: Math.random() * (this.mapHeight - 100) + 50,
                hp,
                maxHp: hp,
                country: socket.user?.country || "vn",
                score: 0,
                damageMultiplier: skinBuff.damageMultiplier || 1,
                onHitEffect: skinBuff.onHitEffect || null
            };

            io.emit("players_update", this.players);
        });

        socket.on("respawn", () => {
            const nickname = `R-${Math.floor(Math.random() * 1000)}`;
            GameAPI.players[socket.id] = {
                id: socket.id,
                nickname,
                username: socket.username || "anonymous",
                country: socket.user?.country || "vn",
                x: Math.random() * (this.mapWidth - 100) + 50,
                y: Math.random() * (this.mapHeight - 100) + 50,
                hp: 100,
                score: 0
            };
        });

        socket.on("ping_check", () => {
            socket.emit("pong_check");
        });

        socket.on("disconnect", async () => {
            const player = this.players[socket.id];
            if (player?.username) {
                await User.updateOne({ username: player.username }, { isOnline: false });
            }
            delete this.players[socket.id];
            AntiCheat.clear(socket.id);
            io.emit("player_left", socket.id);
        });
    }

    static gameLoop(io) {
        this.bullets.forEach((b) => {
            b.x += b.dirX * 10;
            b.y += b.dirY * 10;
            b.lifetime++;

            for (let id in this.players) {
                const p = this.players[id];
                if (id !== b.owner && p.hp > 0) {
                    const dx = p.x - b.x;
                    const dy = p.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 20) {
                        const shooter = this.players[b.owner];
                        const multiplier = shooter?.damageMultiplier || 1;
                        const damage = Math.floor(20 * multiplier);

                        p.hp -= damage;
                        AntiCheat.checkAutoAim(b.owner, true);

                        // === Hiệu ứng đặc biệt ===
                        const effect = shooter?.onHitEffect;

                        if (effect === "burn") {
                            p.burn = {
                                damagePerSecond: 5,
                                duration: Math.floor(Math.random() * 3) + 3, // 3–5s
                                timer: 0
                            };
                        }

                        if (effect === "slow") {
                            p.slow = {
                                factor: 0.5,
                                duration: 10,
                                timer: 0
                            };
                        }

                        if (p.hp <= 0) {
                            const killer = this.players[b.owner];
                            if (killer) killer.score = (killer.score || 0) + 1;

                            delete this.players[id];
                            io.to(id).emit("player_dead");
                        } else {
                            io.to(id).emit("player_hit", p.hp);
                        }

                        b.lifetime = 9999;
                    }
                }
            }
            AntiCheat.checkAutoAim(b.owner, false);
        });

        this.bullets = this.bullets.filter(b => b.lifetime < 50);

        const deltaTime = 1000 / 60;

        for (let id in this.players) {
            const p = this.players[id];

            // 🔥 burn effect
            if (p.burn) {
                p.burn.timer += deltaTime;
                if (p.burn.timer >= 1000) {
                    p.hp -= p.burn.damagePerSecond;
                    p.burn.timer = 0;
                    p.burn.duration--;

                    if (p.hp <= 0) {
                        io.to(id).emit("player_dead");
                        delete this.players[id];
                        continue;
                    }

                    if (p.burn.duration <= 0) {
                        delete p.burn;
                    }
                }
            }

            // 🌀 slow effect
            if (p.slow) {
                p.slow.timer += deltaTime;
                if (p.slow.timer >= 1000) {
                    p.slow.timer = 0;
                    p.slow.duration--;

                    if (p.slow.duration <= 0) {
                        delete p.slow;
                    }
                }
            }
        }

        io.emit("bullets_update", this.bullets);

        const top5 = Object.values(this.players)
            .filter(p => p.hp > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        io.emit("leaderboard_update", top5.map((p, i) => ({
            rank: i + 1,
            nickname: p.nickname,
            score: p.score,
            country: p.country || "vn"
        })));
    }

    static getPlayerCount() {
        return Object.keys(this.players).length;
    }
}

export default GameAPI;