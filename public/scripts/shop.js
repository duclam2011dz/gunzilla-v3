const shopItems = [
    {
        name: "Gỡ quảng cáo",
        id: "noads",
        price: 5,
        css: "none"
    },
    {
        name: "Skin: Lava",
        id: "skin_lava",
        price: 3,
        css: "lava"
    },
    {
        name: "Skin: Neon",
        id: "skin_neon",
        price: 3,
        css: "neon"
    },
    {
        name: "Skin: Black Hole",
        id: "skin_blackhole",
        price: 3,
        css: "blackhole"
    },
    {
        name: "Skin: Galaxy",
        id: "skin_galaxy",
        price: 3,
        css: "galaxy"
    }
];

const container = document.getElementById("shopContainer");

let ownedSkins = [];

const username = sessionStorage.getItem("username");

if (username) {
    const res = await fetch("/api/auth/get-skins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
    });
    const data = await res.json();
    ownedSkins = data.vipSkins;
}

shopItems.forEach(item => {
    const card = document.createElement("div");
    card.className = "shop-card";

    const preview = document.createElement("div");
    preview.className = `skin-preview ${item.css}`;
    card.appendChild(preview);

    const title = document.createElement("h3");
    title.innerText = item.name;
    card.appendChild(title);

    const price = document.createElement("div");
    price.className = "price";
    price.innerText = `$${item.price}`;
    card.appendChild(price);

    const btn = document.createElement("button");
    if (ownedSkins.includes(item.id)) {
        btn.innerText = "Đã sở hữu";
        btn.disabled = true;
        btn.style.backgroundColor = "gray";
    } else {
        btn.innerText = "Mua ngay";
        btn.onclick = () => {
            fetch("/api/shop/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: item.id })
            })
                .then(res => res.json())
                .then(data => {
                    const stripe = Stripe(data.publishableKey);
                    stripe.redirectToCheckout({ sessionId: data.sessionId });
                });
        };
    }

    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    const productId = urlParams.get("product");

    if (success && productId?.startsWith("skin_")) {
        const username = sessionStorage.getItem("username");
        fetch("/api/auth/unlock-skin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, skin: productId })
        })
    }

    card.appendChild(btn);
    container.appendChild(card);
});

document.getElementById("shopCloseBtn").onclick = () => {
    window.location.href = "/templates/menu.html";
};