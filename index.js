const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("❌ BOT_TOKEN is missing");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// ===== /start =====
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    "🎉 Chào mừng bạn đã đến với BOT THUỲ LINH 🎉",
    {
      reply_markup: {
        keyboard: [
          ["📌 Nhiệm vụ 1", "📌 Nhiệm vụ 2"]
        ],
        resize_keyboard: true
      }
    }
  );
});

// ===== XỬ LÝ TIN NHẮN =====
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Tránh trả lời lại khi gõ /start
  if (text === "/start") return;

  // ===== NHIỆM VỤ 1 =====
  if (text === "📌 Nhiệm vụ 1") {
    bot.sendMessage(
      chatId,
      `🔥 *NV1: Tham Gia Các Hội Nhóm*  
💰 *CÔNG: 50K*

🤖 BOT 1:
https://t.me/Kiemtien8989_bot?start=r03486044000

📌 *Cách làm:*
- Nhấp vào tất cả kênh / nhóm
- Ấn Join hoặc Mute tham gia hết
- Xong quay lại bot

⚠️ *LƯU Ý:*  
Phải hiện: _invited by user Thuỳ Linh_ mới được em nhé ✅`,
      { parse_mode: "Markdown" }
    );
    return;
  }

  // ===== NHIỆM VỤ 2 =====
  if (text === "📌 Nhiệm vụ 2") {
    bot.sendMessage(
      chatId,
      `🔥 *NV2: KIẾM TIỀN COMMENT THREAD*

📌 *Cách làm:*
- Lên Thread
- Bình luận và gửi hình ảnh dưới các post
- Chụp màn hình lúc đã CMT

💰 *Thu nhập:*
- 1 CMT = *5K*
- Đủ *10 CMT* là được rút lương
- ❌ *KHÔNG GIỚI HẠN* số lượng
- CMT càng nhiều → thu nhập càng cao

📸 Làm xong gửi hình ảnh minh chứng để được duyệt nhé 💖`,
      { parse_mode: "Markdown" }
    );
    return;
  }
});

console.log("✅ Bot is running...");