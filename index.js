const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
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

// Xử lý nút bấm
bot.on("message", (msg) => {
  const text = msg.text;
  const chatId = msg.chat.id;

  if (text === "📌 Nhiệm vụ 1") {
    bot.sendMessage(
      chatId,
      `🔥 NV1: Tham Gia Các Hội Nhóm Ở Link Dưới Đây  
💰 CÔNG: 50K

🤖 BOT 1:
https://t.me/Kiemtien8989_bot?start=r03486044000

📌 YÊU CẦU:
- Nhấp vào tất cả kênh/nhóm
- Ấn Join hoặc Mute tham gia hết
- Xong quay lại bot và ấn CHECK

⚠️ LƯU Ý:
Phải hiện: *invited by user Thuỳ Linh* mới được em nhé ✅`,
      { parse_mode: "Markdown" }
    );
  }

  if (text === "📌 Nhiệm vụ 2") {
    bot.sendMessage(
      chatId,
      "📌 Nhiệm vụ 2 hiện chưa mở. Vui lòng quay lại sau nhé 😊"
    );
  }
});