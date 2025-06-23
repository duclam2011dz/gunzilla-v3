class AuthManager {
    constructor() {
        this.loginForm = document.getElementById("loginForm");
        this.registerForm = document.getElementById("registerForm");
        this.toRegister = document.getElementById("toRegister");
        this.toLogin = document.getElementById("toLogin");

        this.attachEvents();
    }

    attachEvents() {
        this.toRegister.onclick = (e) => {
            e.preventDefault();
            this.loginForm.classList.remove("active");
            this.registerForm.classList.add("active");
        };

        this.toLogin.onclick = (e) => {
            e.preventDefault();
            this.registerForm.classList.remove("active");
            this.loginForm.classList.add("active");
        };

        this.loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const username = document.getElementById("loginUsername").value;
            const password = document.getElementById("loginPassword").value;

            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();
            if (res.ok) {
                sessionStorage.setItem("username", username);
                sessionStorage.setItem("email", data.email);
                window.location.href = "/templates/menu.html";
            } else {
                alert(data.message || "Đăng nhập thất bại");
            }
        };

        this.registerForm.onsubmit = async (e) => {
            e.preventDefault();
            const username = document.getElementById("registerUsername").value;
            const email = document.getElementById("registerEmail").value;
            const password = document.getElementById("registerPassword").value;
            const retype = document.getElementById("registerRetype").value;

            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password, retype }),
            });

            const data = await res.json();
            if (res.ok) {
                sessionStorage.setItem("username", username);
                sessionStorage.setItem("email", email);
                window.location.href = "/templates/verify.html";
            } else {
                alert(data.message || "Đăng ký thất bại");
            }
        };
    }
}

class Validator {
    static validateFields(...fields) {
        return fields.every(field => field.trim().length > 0);
    }
}

function setupPasswordToggles() {
    // LOGIN toggle
    const loginToggle = document.getElementById("toggleLoginPassword");
    const loginInput = document.getElementById("loginPassword");

    loginToggle.onclick = () => {
        const isHidden = loginInput.type === "password";
        loginInput.type = isHidden ? "text" : "password";
        loginToggle.classList.toggle("fa-eye", !isHidden);
        loginToggle.classList.toggle("fa-eye-slash", isHidden);
    };

    // REGISTER toggle
    const registerToggle = document.getElementById("toggleRegisterPassword");
    const registerInput = document.getElementById("registerPassword");

    registerToggle.onclick = () => {
        const isHidden = registerInput.type === "password";
        registerInput.type = isHidden ? "text" : "password";
        registerToggle.classList.toggle("fa-eye", !isHidden);
        registerToggle.classList.toggle("fa-eye-slash", isHidden);
    };
}

window.onload = () => {
    new AuthManager();
    setupPasswordToggles();
};