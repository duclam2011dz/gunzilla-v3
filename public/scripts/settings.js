class SettingsPage {
    constructor() {
        this.logoutBtn = document.getElementById("logoutBtn");
        this.closeBtn = document.getElementById("closeBtn");

        this.attachEvents();
        this.initControlSetting();
    }

    attachEvents() {
        this.logoutBtn.onclick = () => {
            sessionStorage.clear(); // clear sessionStorage
            fetch("/api/auth/logout", { method: "POST" }); // notify server
            window.location.href = "/templates/auth.html";
        };

        this.closeBtn.onclick = () => {
            window.location.href = "/templates/menu.html";
        };
    }

    initControlSetting() {
        const select = document.getElementById("controlSelect");
        const current = localStorage.getItem("controlMode") || "keyboard";
        select.value = current;

        select.onchange = () => {
            localStorage.setItem("controlMode", select.value);
            alert("✅ Đã lưu chế độ điều khiển!");
        };
    }
}

document.querySelectorAll(".skin").forEach(skinEl => {
    skinEl.onclick = async () => {
        const username = sessionStorage.getItem("username");
        const color = skinEl.dataset.color;

        await fetch("/api/auth/skin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, skin: color })
        });

        alert("Đã chọn skin màu: " + color);
    };
});

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

const username = sessionStorage.getItem("username");

fetch("/api/auth/get-skins", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username })
})
    .then(res => res.json())
    .then(data => {
        const container = document.querySelector(".skins");

        data.vipSkins.forEach(skinId => {
            const skinDiv = document.createElement("div");
            skinDiv.className = `skin ${skinId}`;
            skinDiv.classList.add(getEffectClassFromSkinId(skinId));
            skinDiv.dataset.color = skinId;
            container.appendChild(skinDiv);

            skinDiv.onclick = () => {
                fetch("/api/auth/skin", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, skin: skinId })
                });
                alert(`Đã chọn skin VIP: ${skinId}`);
            };
        });
    });

const flagSelect = document.getElementById("flagSelect");

fetch("/api/auth/getprofile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username })
})
    .then(res => res.json())
    .then(data => {
        flagSelect.value = data.country || "vn";
    });

flagSelect.onchange = () => {
    fetch("/api/auth/update-flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username,
            country: flagSelect.value
        })
    });
};

function getEffectClassFromSkinId(id) {
    const map = {
        skin_lava: "lava",
        skin_neon: "neon",
        skin_blackhole: "blackhole",
        skin_galaxy: "galaxy"
    };
    return map[id] || "";
}

window.onload = () => new SettingsPage();