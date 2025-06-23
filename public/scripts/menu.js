class Menu {
    constructor() {
        this.playBtn = document.getElementById("playBtn");
        this.settingsBtn = document.getElementById("settingsBtn");
        this.quitBtn = document.getElementById("quitBtn");
        this.shopBtn = document.getElementById("shopBtn");
        this.nicknameInput = document.getElementById("nickname");
        this.attachEvents();
    }

    attachEvents() {
        this.playBtn.onclick = () => {
            const nickname = this.nicknameInput.value.trim();
            if (!nickname || nickname.length < 2) {
                return alert("Vui lòng nhập nickname hợp lệ (tối thiểu 2 ký tự).");
            }
            sessionStorage.setItem("nickname", nickname);
            window.location.href = "/templates/game.html";
        };

        this.settingsBtn.onclick = () => {
            window.location.href = "/templates/settings.html";
        };

        this.shopBtn.onclick = () => {
            window.location.href = "/templates/shop.html";
        };

        this.quitBtn.onclick = () => {
            window.close();
        };
    }
}

class SoundManager {
    // Placeholder để tương lai xử lý âm thanh
    static playClickSound() {
        console.log("Click sound played");
    }
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

window.onload = () => new Menu();