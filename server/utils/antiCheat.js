import { sendBanWarning } from "./mailer.js";

const MAX_SHOTS_PER_SECOND = 15;

class AntiCheat {
    constructor() {
        this.shootTimestamps = {};
        this.violations = {};
    }

    registerShoot(socketId) {
        const now = Date.now();
        if (!this.shootTimestamps[socketId]) {
            this.shootTimestamps[socketId] = [];
        }

        // Giữ lại các mốc thời gian trong 1 giây gần nhất
        this.shootTimestamps[socketId] = this.shootTimestamps[socketId].filter(
            (ts) => now - ts <= 1000
        );

        this.shootTimestamps[socketId].push(now);

        if (this.shootTimestamps[socketId].length > MAX_SHOTS_PER_SECOND) {
            console.warn(`[ANTI-CHEAT] ${socketId} đang bắn quá nhanh (${this.shootTimestamps[socketId].length} viên/s)!`);
            return true;
        }

        return false;
    }

    clear(socketId) {
        delete this.shootTimestamps[socketId];
        delete this.violations[socketId];
    }

    checkSpeedHack(socketId, dirX, dirY, actualDeltaX, actualDeltaY, baseSpeed) {
        // Tính độ dài vector điều khiển
        const inputMagnitude = Math.sqrt((dirX || 0) ** 2 + (dirY || 0) ** 2);
        if (inputMagnitude === 0) return false;

        const actualDistance = Math.sqrt(actualDeltaX ** 2 + actualDeltaY ** 2);
        const expectedMax = baseSpeed * 1.1; // cho phép lệch 10%

        if (actualDistance > expectedMax + 0.5) {
            console.warn(`[ANTI-SPEEDHACK] Player ${socketId} di chuyển quá nhanh (${actualDistance.toFixed(2)}px)`);
            return true;
        }

        return false;
    }

    checkAutoAim(socketId, didHit) {
        const now = Date.now();
        if (!this.aimStats) this.aimStats = {};
        if (!this.aimStats[socketId]) {
            this.aimStats[socketId] = {
                totalShots: 0,
                hitShots: 0,
                lastReset: now
            };
        }

        const stats = this.aimStats[socketId];
        stats.totalShots++;
        if (didHit) stats.hitShots++;

        // Reset mỗi 10 giây
        if (now - stats.lastReset > 10000) {
            stats.totalShots = 0;
            stats.hitShots = 0;
            stats.lastReset = now;
        }

        // Nếu bắn >10 viên và tỷ lệ chính xác > 90%
        const accuracy = (stats.hitShots / stats.totalShots) * 100;
        if (stats.totalShots >= 10 && accuracy > 90) {
            console.warn(`[ANTI-AUTO-AIM] Player ${socketId} có tỷ lệ bắn trúng ${accuracy.toFixed(1)}% (${stats.hitShots}/${stats.totalShots})`);
            this.registerViolation(socketId, "Auto-aim");
        }

        return false;
    }

    registerViolation(socket, reason) {
        if (!this.violations[socket.id]) {
            this.violations[socket.id] = { count: 0, lastViolation: Date.now() };
        }

        this.violations[socket.id].count++;
        this.violations[socket.id].lastViolation = Date.now();

        console.warn(`[AUTO-BAN] ${socket.id} vi phạm: ${reason} (${this.violations[socket.id].count}/3)`);

        if (socket.user?.email) {
            console.log(`[EMAIL] Chuẩn bị gửi tới ${socket.user.email}`);
            sendBanWarning(socket.user.email, reason);
        }

        if (this.violations[socket.id].count >= 3) {
            console.warn(`[BANNED] ${socket.id} đã bị ban vì gian lận!`);
            socket.emit("banned", reason);
            socket.disconnect(true);
        }
    }
}

export default new AntiCheat();