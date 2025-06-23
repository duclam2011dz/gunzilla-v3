# 🔫 Gunzilla v3.0 – Multiplayer Top-down Shooter (Anti-Cheat + Mobile + OTP + Quốc Tịch)

Gunzilla v3.0 là bản nâng cấp cực đại của tựa webgame bắn súng multiplayer góc nhìn top-down do [LâmĐZ2k11](https://github.com/duclam2011dz) phát triển, hỗ trợ đồng bộ real-time, chống cheat, xác thực email và hỗ trợ full mobile điều khiển.

---

## 🚀 Tính năng mới trong v3.0

### 🔒 Anti-Cheat (phát hiện và auto-ban):
- Phát hiện **auto-shoot** (bắn quá 15 viên/s)
- Phát hiện **speedhack** (di chuyển nhanh bất thường kể cả đường chéo)
- Phát hiện **auto-aim** (góc bắn luôn chính xác)
- Cảnh báo qua **email** (Nodemailer)
- Auto-ban sau 3 lần vi phạm (trả về menu)

### 📧 Xác thực Email qua OTP:
- Gửi **mã OTP 6 số** khi đăng ký
- Giao diện đẹp với 6 ô nhập mã
- Hết hạn OTP sau 5 phút
- Chỉ sau khi xác thực mới được vào game

### 📱 Hỗ trợ mobile:
- **Joystick kéo-thả** (nipplejs)
- **D-pad 4 nút** (↑ ↓ ← →)
- Cho phép chọn **chế độ điều khiển**: bàn phím / joystick / dpad
- Tự ẩn/bật input tương ứng với lựa chọn

### 🏳 Quốc tịch & Quốc kỳ:
- Người chơi có thể chọn **quốc tịch** từ 20 nước trong Settings
- Hiển thị **quốc kỳ cạnh tên** trong game
- Lưu quốc tịch vào MongoDB (`UserSchema.country`)
- Đồng bộ quốc kỳ trong **leaderboard**

### 📊 HUD FPS & Ping:
- Hiển thị HUD realtime ở góc trái:
  - FPS: tốc độ khung hình
  - Ping: độ trễ kết nối
- **Tự đổi màu** theo mức:
  - 🟢 Xanh đậm: FPS ≥ 60 / Ping ≤ 50ms (mượt)
  - 🟢 Xanh nhạt: FPS ≥ 40 / Ping ≤ 100ms (ổn)
  - 🟡 Vàng: FPS ≥ 20 / Ping ≤ 200ms (trễ)
  - 🔴 Đỏ: FPS < 20 / Ping > 200ms (lag/mất kết nối)

### 👑 Leaderboard nâng cấp:
- Top 1: tên màu **vàng**
- Top 2: **bạc**
- Top 3: **đồng**
- Hiển thị quốc kỳ kèm tên

---

## 📁 Cấu trúc dự án

Gunzilla/
├── public/
│ ├── templates/ # HTML: auth, game, menu, verify, settings
│ ├── styles/ # CSS: responsive + biến CSS
│ ├── scripts/ # JS: game, joystick, verify, dpad, settings
│
├── server/
│ ├── api/ # game.api.js, auth.api.js
│ ├── models/ # user.model.js (có thêm country, OTP)
│ ├── routes/ # auth.routes.js, game.routes.js
│ ├── utils/ # logger.js, otp.service.js, mailer.js
│ └── server.js # Khởi chạy chính
│
├── .env # (KHÔNG đẩy lên GitHub)
├── README.md

yaml
Sao chép
Chỉnh sửa

---

## ⚙️ Công nghệ sử dụng

- Fullstack: Node.js + Express + Socket.IO + MongoDB Atlas
- Frontend: HTML5, CSS3 (biến), JS OOP
- Email: Nodemailer
- Mobile control: nipplejs, touch-events
- OTP: hệ thống tự sinh, lưu vào DB, kiểm tra thời hạn

---

## 📦 Cách chạy local

```bash
npm install
npm run dev

🌐 Backup & Triển khai

🛡 Backup lên GitHub (đã làm):

git init
echo ".env" > .gitignore
git add .
git commit -m "🎯 Gunzilla v3.0 - full anti-cheat, mobile, OTP"
git remote add origin https://github.com/your-username/gunzilla-v3.git
git branch -M main
git push -u origin main

🚀 Triển khai:

Gợi ý: dùng Render.com, Railway, hoặc VPS riêng.

🧠 Tác giả
LâmĐZ2k11 – sinh viên & fullstack dev với đam mê game, code & đập bug
"Code sạch, UI đẹp, anti cheat gắt = Gunzilla chất"

📅 Phiên bản
Gunzilla v3.0 – Tháng 6/2025
Cập nhật bởi ChatGPT x LâmĐZ2k11 💥

---

## ✅ Sau khi thay xong README.md:

```bash
git add README.md
git commit -m "📝 Update README.md cho Gunzilla v3.0"
git push