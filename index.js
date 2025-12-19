const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("❌ BOT_TOKEN is missing");
  process.exit(1);
}

// Khởi tạo bot (polling)
const bot = new TelegramBot(token, { polling: true });

// ===== /start =====
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    "🎉 *Chào Mừng CTV mới đến với BOT của Thuỳ Linh!* 🎉\n\n" +
    "Các bạn ấn vào các nhiệm vụ dưới đây để hoàn thành rồi gửi cho @thuylinhnei để nhận lương. Chúc các bạn làm việc thật thành công ❤️",
    {
      parse_mode: "Markdown",
      reply_markup: {
        keyboard: [
          [{ text: "📌 Nhiệm vụ 1" }],
          [{ text: "📌 Nhiệm vụ 2" }],
          [{ text: "📌 Nhiệm vụ 3" }],
          [{ text: "✅ Đã xong" }]
        ],
        resize_keyboard: true
      }
    }
  );
});

// ===== NHIỆM VỤ =====
const tasks = {
  "📌 Nhiệm vụ 1": `🔥 *NV1: Tham Gia Các Hội Nhóm*  
💰 *CÔNG: 20K*

🤖 BOT 1: [Nhấn vào đây](https://t.me/Kiemtien8989_bot?start=r03486044000)

📌 *Cách làm:*
- Nhấp vào tất cả kênh / nhóm
- Ấn Join hoặc Mute tham gia hết
- Quay lại bot sau khi hoàn thành

➡️ Hoàn thành xong ấn sang *Nhiệm vụ 2*`,

  "📌 Nhiệm vụ 2": {
    text: `🔥 *NV2: CÔNG VIỆC TRÊN THREAD*

📌 *Cách làm:*
- Lên Thread
- Bình luận và gửi hình ảnh
- Chụp màn hình lúc đã CMT

💰 *Thu nhập:*
- 1 CMT = 5K
- Đủ 20 CMT rút lương
- ❌ Không giới hạn
- CMT càng nhiều → thu nhập càng cao

⬇️ Bấm nút bên dưới để xem hướng dẫn và lấy ảnh`,
    button: { text: "Bấm vào đây", url: "https://t.me/thuylinhnei1/38" }
  },

  "📌 Nhiệm vụ 3": {
    text: `🔥 *NV3: CÔNG VIỆC TRÊN TIKTOK*

📌 *Cách làm:*
- Search từ khóa tuyển dụng
- REP comment người tìm việc (mới nhất)
- Chụp màn hình lúc đã CMT

💰 *Thu nhập:*
- 1 CMT = 5K
- Đủ 20 CMT rút lương
- ❌ Không giới hạn
- CMT càng nhiều → thu nhập càng cao

⬇️ Bấm nút bên dưới để xem hướng dẫn và lấy ảnh`,
    button: { text: "Bấm vào đây", url: "https://t.me/thuylinhnei1/42" }
  }
};

// ===== XỬ LÝ TIN NHẮN =====
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return;
  if (text === "/start") return;

  if (text === "✅ Đã xong") {
    await bot.sendMessage(
      chatId,
      "🎉 *Chúc mừng bạn đã hoàn thành đủ 3 Nhiệm Vụ!*\n\n" +
      "👉 Giờ bạn hãy nhắn cho Thuỳ Linh gửi đủ sản phẩm đã làm\n" +
      "⬇️⬇️⬇️",
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "Ấn vào đây", url: "https://t.me/thuylinhnei" }]
          ]
        }
      }
    );
    return;
  }

  if (tasks[text]) {
    const task = tasks[text];
    if (typeof task === "string") {
      await bot.sendMessage(chatId, task, { parse_mode: "Markdown" });
    } else {
      await bot.sendMessage(chatId, task.text, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[task.button]]
        }
      });
    }
  }
});

console.log("🤖 Bot is running...");