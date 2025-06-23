class OTPVerifier {
    constructor() {
        this.inputs = Array.from(document.querySelectorAll(".otp-box"));
        this.verifyBtn = document.getElementById("verifyBtn");
        this.errorText = document.getElementById("errorText");
        this.resendBtn = document.getElementById("resendBtn");

        this.attachEvents();
    }

    attachEvents() {
        this.inputs.forEach((input, index) => {
            input.addEventListener("input", () => {
                if (input.value.length === 1 && index < this.inputs.length - 1) {
                    this.inputs[index + 1].focus();
                }
            });

            input.addEventListener("keydown", (e) => {
                if (e.key === "Backspace" && input.value === "" && index > 0) {
                    this.inputs[index - 1].focus();
                }
            });
        });

        this.verifyBtn.onclick = () => this.submitOTP();

        this.resendBtn.onclick = (e) => {
            e.preventDefault();
            this.resendOTP();
        };
    }

    getOTP() {
        return this.inputs.map(input => input.value).join("");
    }

    async submitOTP() {
        const otp = this.getOTP();
        const username = sessionStorage.getItem("username");

        if (!otp || otp.length !== 6 || isNaN(otp)) {
            return this.showError("Mã OTP phải là 6 chữ số!");
        }

        const res = await fetch("/api/auth/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, otp })
        });

        const data = await res.json();
        if (res.ok) {
            alert("Xác thực thành công! Vui lòng đăng nhập lại.");
            sessionStorage.clear();
            window.location.href = "/templates/auth.html";
        } else {
            this.showError(data.message || "Xác thực thất bại!");
        }
    }

    async resendOTP() {
        const username = sessionStorage.getItem("username");
        const res = await fetch("/api/auth/resend-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username })
        });

        const data = await res.json();
        alert(data.message || "Đã gửi lại mã!");
    }

    showError(msg) {
        this.errorText.innerText = msg;
        this.errorText.classList.remove("hidden");
    }
}

window.onload = () => new OTPVerifier();