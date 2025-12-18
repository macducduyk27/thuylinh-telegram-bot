const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Lệnh /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "👋 Chào bạn!\nBạn muốn làm gì?",
    {
      reply_markup: {
        keyboard: [
          ["📄 Gửi CV", "💼 Xem việc làm"]
        ],
        resize_keyboard: true
      }
    }
  );
});

// Xử lý khi bấm nút
bot.on("message", (msg) => {
  if (msg.text === "📄 Gửi CV") {
    bot.sendMessage(msg.chat.id, "📩 Vui lòng gửi CV của bạn (PDF / ảnh).");
  }

  if (msg.text === "💼 Xem việc làm") {
    bot.sendMessage(msg.chat.id, "💼 Hiện chưa có việc làm phù hợp.");
  }
});