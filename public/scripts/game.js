import {
    drawBlackHoleEffect,
    drawLavaEffect,
    drawNeonGlow,
    drawGalaxySwirl
} from "./skinEffects.js";
import { JoystickController } from "./joystick.js";

class Player {
    constructor(id, x, y, nickname, hp = 100, skin = "lime") {
        this.id = id;
        this.x = x;
        this.y = y;
        this.nickname = nickname;
        this.hp = hp;
        this.skin = skin;
    }

    draw(ctx, offsetX, offsetY, time) {
        const x = this.x - offsetX;
        const y = this.y - offsetY;

        switch (this.skin) {
            case "skin_blackhole":
                drawBlackHoleEffect(ctx, x, y, this);
                break;
            case "skin_lava":
                drawLavaEffect(ctx, x, y, time);
                break;
            case "skin_neon":
                drawNeonGlow(ctx, x, y, time);
                break;
            case "skin_galaxy":
                drawGalaxySwirl(ctx, x, y, time);
                break;
            default:
                ctx.fillStyle = this.skin || "lime";
                ctx.fillRect(x - 10, y - 10, 20, 20);
        }

        // Nickname
        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.fillText(this.nickname, this.x - offsetX - 15, this.y - offsetY + 30);

        // Health bar
        const hpColor = this.hp > 60 ? "green" : this.hp > 20 ? "yellow" : "red";
        ctx.fillStyle = "#444";
        ctx.fillRect(this.x - 10 - offsetX, this.y - 20 - offsetY, 20, 4);
        ctx.fillStyle = hpColor;
        ctx.fillRect(this.x - 10 - offsetX, this.y - 20 - offsetY, 20 * (this.hp / 100), 4);
    }
}

class Bullet {
    constructor(x, y, dirX, dirY) {
        this.x = x;
        this.y = y;
        this.dirX = dirX;
        this.dirY = dirY;
        this.speed = 10;
    }

    update() {
        this.x += this.dirX * this.speed;
        this.y += this.dirY * this.speed;
    }

    draw(ctx, offsetX, offsetY) {
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(this.x - offsetX, this.y - offsetY, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.socket = io();

        this.nickname = sessionStorage.getItem("nickname") || "Player";
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.playerId = null;
        this.players = {};
        this.bullets = [];
        this.keyStates = {};

        this.lastFrameTime = Date.now();
        this.fps = 0;
        this.ping = 0;

        this.loadingProgress = 0;
        this.loadingScreen = document.getElementById("loadingScreen");
        this.loadingBar = document.getElementById("loadingBar");
        this.loadingPercent = document.getElementById("loadingPercent");
        this.loadingSteps = {
            connected: false,
            skinLoaded: false,
            nicknameSent: false,
            playersReceived: false
        };

        this.controlMode = localStorage.getItem("controlMode") || "keyboard";
        if (this.controlMode === "joystick") {
            document.getElementById("joystickZone").style.display = "block";
            this.joystick = new JoystickController((x, y) => {
                this.mobileInput = { dirX: x, dirY: y };
            });
        } else {
            document.getElementById("joystickZone").style.display = "none";
        }

        const dpad = document.getElementById("dpad");

        if (this.controlMode === "dpad") {
            dpad.classList.remove("hidden");
            this.initDpadEvents();
        } else {
            dpad.classList.add("hidden");
        }

        this.keys = {};
        this.setupSocketEvents();
        this.attachEvents();

        requestAnimationFrame(() => this.gameLoop());
    }

    async init() {
        const username = sessionStorage.getItem("username");
        const email = sessionStorage.getItem("email");

        await fetch("/api/auth/getskin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username })
        })
            .then(res => res.json())
            .then(data => this.skin = data.skin || "lime");

        this.loadingSteps.skinLoaded = true;
        this.updateLoading();

        this.socket.emit("set_user_info", {
            username,
            email
        }, () => {
            // ✅ Chỉ khi server xác nhận đã gán user → mới gọi nickname
            this.socket.emit("set_nickname", {
                nickname: this.nickname,
                username,
                skin: this.skin
            });

            this.loadingSteps.nicknameSent = true;
            this.updateLoading();
        });
    }

    attachEvents() {
        if (this.controlMode === "keyboard") {
            window.addEventListener("keydown", (e) => {
                this.keyStates[e.key] = true;
            });

            window.addEventListener("keyup", (e) => {
                this.keyStates[e.key] = false;
            });
        }

        this.canvas.addEventListener("click", (e) => {
            const player = this.players[this.playerId];
            if (!player) return;

            const rect = this.canvas.getBoundingClientRect();
            const targetX = e.clientX + this.getOffsetX();
            const targetY = e.clientY + this.getOffsetY();

            const dx = targetX - player.x;
            const dy = targetY - player.y;
            const mag = Math.sqrt(dx * dx + dy * dy);

            const dirX = dx / mag;
            const dirY = dy / mag;

            this.bullets.push(new Bullet(player.x, player.y, dirX, dirY));

            this.socket.emit("shoot", {
                x: player.x,
                y: player.y,
                dirX,
                dirY,
            });
        });

        window.addEventListener("resize", () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    updateLoading() {
        const steps = this.loadingSteps;
        const completed = Object.values(steps).filter(Boolean).length;
        const percent = Math.floor((completed / 4) * 100);

        this.loadingBar.style.width = `${percent}%`;
        this.loadingPercent.innerText = `Loading... ${percent}%`;

        if (percent === 100) {
            setTimeout(() => {
                this.loadingScreen.style.display = "none";
            }, 300);
        }
    }

    setupSocketEvents() {
        this.socket.on("connect", () => {
            this.playerId = this.socket.id;
            this.loadingSteps.connected = true;
            this.updateLoading();
            this.init();
        });

        setInterval(() => {
            const sent = Date.now();
            this.socket.emit("ping_check");
            this.socket.once("pong_check", () => {
                this.ping = Date.now() - sent;
            });
        }, 1000);

        this.socket.on("players_update", (serverPlayers) => {
            this.players = {};
            for (let id in serverPlayers) {
                const p = serverPlayers[id];
                this.players[id] = new Player(id, p.x, p.y, `${flagEmoji(p.country)} ${p.nickname}`, p.hp, p.skin);
            }

            if (!this.loadingSteps.playersReceived && Object.keys(this.players).length > 0) {
                this.loadingSteps.playersReceived = true;
                this.updateLoading();
            }
        });

        this.socket.on("player_left", (id) => {
            delete this.players[id];
        });

        this.socket.on("bullets_update", (serverBullets) => {
            this.bullets = serverBullets.map(b => new Bullet(b.x, b.y, b.dirX, b.dirY));
        });

        this.socket.on("player_hit", (newHp) => {
            const p = this.players[this.playerId];
            if (p) p.hp = newHp;
        });

        this.socket.on("player_dead", () => {
            delete this.players[this.playerId];
            document.getElementById("gameOverUI").classList.remove("hidden");
        });

        this.socket.on("leaderboard_update", (topPlayers) => {
            const list = document.getElementById("leaderboardList");
            list.innerHTML = "";

            topPlayers.forEach(player => {
                const li = document.createElement("li");
                const flag = flagEmoji(player.country);

                li.innerText = `#${player.rank} ${flag} ${player.nickname} - ${player.score}`;

                // Tô màu TOP 1, 2, 3
                if (player.rank === 1) {
                    li.style.color = "#FFD700"; // Gold
                    li.style.fontWeight = "bold";
                } else if (player.rank === 2) {
                    li.style.color = "#C0C0C0"; // Silver
                } else if (player.rank === 3) {
                    li.style.color = "#CD7F32"; // Copper (bronze)
                }

                list.appendChild(li);
            });
        });

        this.socket.on("banned", (reason) => {
            alert(`Bạn đã bị ban khỏi game vì: ${reason}`);
            window.location.href = "/templates/menu.html"; // quay về menu
        });

        document.getElementById("replayBtn").onclick = () => {
            this.nickname = sessionStorage.getItem("nickname") || `P-${Math.random() * 999}`;
            this.socket.emit("respawn");
            document.getElementById("gameOverUI").classList.add("hidden");
        };

        this.socket.on("nickname_taken", () => {
            alert("Tên đã được sử dụng trong server. Vui lòng chọn tên khác.");
            sessionStorage.removeItem("nickname");
            window.location.href = "/templates/menu.html";
        });
    }

    update() {
        const player = this.players[this.playerId];
        if (!player) return;

        let moveInput;
        if (this.controlMode === "joystick") {
            moveInput = this.mobileInput || { dirX: 0, dirY: 0 };
        } else if (this.controlMode === "dpad") {
            moveInput = this.dpadInput || { dirX: 0, dirY: 0 };
        } else {
            moveInput = {
                dirX: (this.keyStates["ArrowRight"] || this.keyStates["d"] ? 1 : 0)
                    - (this.keyStates["ArrowLeft"] || this.keyStates["a"] ? 1 : 0),
                dirY: (this.keyStates["ArrowDown"] || this.keyStates["s"] ? 1 : 0)
                    - (this.keyStates["ArrowUp"] || this.keyStates["w"] ? 1 : 0)
            };
        }

        this.socket.emit("update_position", moveInput);

        this.bullets.forEach((b) => b.update());
    }

    initDpadEvents() {
        this.dpadInput = { dirX: 0, dirY: 0 };

        const setDir = (dx, dy) => {
            this.dpadInput = { dirX: dx, dirY: dy };
        };

        const resetDir = () => setDir(0, 0);

        const bindBtn = (id, dx, dy) => {
            const btn = document.getElementById(id);
            btn.addEventListener("touchstart", () => setDir(dx, dy));
            btn.addEventListener("touchend", resetDir);
            btn.addEventListener("mousedown", () => setDir(dx, dy));
            btn.addEventListener("mouseup", resetDir);
            btn.addEventListener("mouseleave", resetDir);
        };

        bindBtn("btn-up", 0, -1);
        bindBtn("btn-down", 0, 1);
        bindBtn("btn-left", -1, 0);
        bindBtn("btn-right", 1, 0);
    }

    updateHudStats() {
        const fpsEl = document.getElementById("fpsStat");
        const pingEl = document.getElementById("pingStat");

        fpsEl.innerText = `FPS: ${this.fps}`;
        pingEl.innerText = `Ping: ${this.ping} ms`;

        // FPS color
        if (this.fps >= 60) {
            fpsEl.style.color = "#00ff66"; // Xanh đậm
        } else if (this.fps >= 40) {
            fpsEl.style.color = "#66ff99"; // Xanh nhạt
        } else if (this.fps >= 20) {
            fpsEl.style.color = "orange"; // Vàng
        } else {
            fpsEl.style.color = "red"; // Đỏ
        }

        // Ping color
        if (this.ping <= 50) {
            pingEl.style.color = "#00ff66"; // Tốt
        } else if (this.ping <= 100) {
            pingEl.style.color = "#66ff99"; // Ổn
        } else if (this.ping <= 200) {
            pingEl.style.color = "orange"; // Lag nhẹ
        } else {
            pingEl.style.color = "red"; // Lag nặng
        }
    }

    getOffsetX() {
        const player = this.players[this.playerId];
        return player ? player.x - this.canvas.width / 2 : 0;
    }

    getOffsetY() {
        const player = this.players[this.playerId];
        return player ? player.y - this.canvas.height / 2 : 0;
    }

    drawGrid(offsetX, offsetY) {
        const size = 50;
        const cols = Math.ceil(this.canvas.width / size) + 2;
        const rows = Math.ceil(this.canvas.height / size) + 2;

        this.ctx.strokeStyle = "rgba(255,255,255,0.05)";
        for (let i = -1; i < cols; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * size - (offsetX % size), 0);
            this.ctx.lineTo(i * size - (offsetX % size), this.canvas.height);
            this.ctx.stroke();
        }

        for (let j = -1; j < rows; j++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, j * size - (offsetY % size));
            this.ctx.lineTo(this.canvas.width, j * size - (offsetY % size));
            this.ctx.stroke();
        }
    }

    draw(time = 0) {
        const offsetX = this.getOffsetX();
        const offsetY = this.getOffsetY();

        const now = Date.now();
        const delta = now - this.lastFrameTime;
        this.lastFrameTime = now;
        this.fps = Math.round(1000 / delta);
        this.updateHudStats();

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid(offsetX, offsetY);

        Object.values(this.players).forEach((p) => p.draw(this.ctx, offsetX, offsetY, time));
        this.bullets.forEach((b) => b.draw(this.ctx, offsetX, offsetY));
    }

    gameLoop() {
        this.update();
        const time = Date.now();
        this.draw(time);
        requestAnimationFrame(() => this.gameLoop());
    }
}

function flagEmoji(code) {
    if (!code) return "";
    return code.toUpperCase().replace(/./g, char =>
        String.fromCodePoint(0x1f1e6 - 65 + char.charCodeAt())
    );
}

window.addEventListener("beforeunload", async () => {
    const username = sessionStorage.getItem("username");
    if (username) {
        await fetch("/api/auth/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username }),
            keepalive: true
        });
    }
});

document.getElementById("menuBtn").onclick = () => {
    sessionStorage.removeItem("nickname");
    window.location.href = "/templates/menu.html";
};

window.onload = () => new Game();