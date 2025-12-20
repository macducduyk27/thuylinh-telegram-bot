const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("❌ BOT_TOKEN is missing");
  process.exit(1);
}

// ===== TẠO BOT (KHÔNG EXPRESS) =====
const bot = new TelegramBot(token, { polling: true });

// ===== /start =====
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    "🎉 *Chào Mừng CTV mới đến với BOT của Thuỳ Linh!* 🎉\n\n" +
      "Các bạn ấn vào các nhiệm vụ dưới đây để hoàn thành rồi gửi cho @thuylinhnei để nhận lương.\n" +
      "Chúc các bạn làm việc thật thành công ❤️",
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
  "📌 Nhiệm vụ 1": {
    text: `🔥 *NV1: Tham Gia Các Hội Nhóm*
💰 *CÔNG: 20K*

🤖 BOT 1: [Nhấn vào đây](https://t.me/Kiemtien8989_bot?start=r03486044000)

📌 *Cách làm:*
- Nhấp vào tất cả kênh / nhóm
- Ấn Join hoặc Mute tham gia hết
- Quay lại bot sau khi hoàn thành

⚠️ *LƯU Ý:*
Phải hiện: _invited by user Thuỳ Linh_ mới được em nhé ✅

➡️ *Hoàn thành xong ấn sang Nhiệm vụ 2*`
  },

  "📌 Nhiệm vụ 2": {
    text: `🔥 *NV2: CÔNG VIỆC TRÊN THREAD*

📌 *Cách làm:*
- Lên Thread
- Bình luận và gửi hình ảnh dưới các post
- Chụp màn hình lúc đã CMT

💰 *Thu nhập:*
- 1 CMT = 5K
- Đủ 20 CMT là được rút lương
- ❌ KHÔNG GIỚI HẠN số lượng
- CMT càng nhiều → thu nhập càng cao

👇 *Bấm nút bên dưới để xem hướng dẫn và lấy ảnh*
➡️ *Hoàn thành xong ấn sang Nhiệm vụ 3*`,
    button: {
      text: "Bấm vào đây",
      url: "https://t.me/thuylinhnei1/38"
    }
  },

  "📌 Nhiệm vụ 3": {
    text: `🔥 *NV3: CÔNG VIỆC TRÊN TIKTOK*

📌 *Cách làm:*
- Search: Tuyển dụng, MMO, Kiếm tiền online…
- Vào video → REP CMT người tìm việc (MỚI NHẤT)
- Chụp màn hình lúc đã CMT

💰 *Thu nhập:*
- 1 CMT = 5K
- Đủ 20 CMT là được rút lương
- ❌ KHÔNG GIỚI HẠN số lượng
- CMT càng nhiều → thu nhập càng cao

👇 *Bấm nút bên dưới để xem hướng dẫn và lấy ảnh*
➡️ *Hoàn thành xong ấn Đã xong*`,
    button: {
      text: "Bấm vào đây",
      url: "https://t.me/thuylinhnei1/42"
    }
  }
};

// ===== XỬ LÝ TIN NHẮN =====
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Bỏ qua /start
  if (text === "/start") return;

  // ===== NHIỆM VỤ =====
  if (tasks[text]) {
    const task = tasks[text];

    if (task.button) {
      return bot.sendMessage(chatId, task.text, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[task.button]]
        }
      });
    } else {
      return bot.sendMessage(chatId, task.text, { parse_mode: "Markdown" });
    }
  }

  // ===== ĐÃ XONG =====
  if (text === "✅ Đã xong") {
    return bot.sendMessage(
      chatId,
      "🎉 *Chúc mừng bạn đã hoàn thành đủ 3 Nhiệm Vụ!*\n\n" +
        "👉 Giờ bạn hãy nhắn cho Thuỳ Linh và gửi đủ sản phẩm đã làm.\n" +
        "⬇️⬇️⬇️",
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Ấn vào đây",
                url: "https://t.me/thuylinhnei"
              }
            ]
          ]
        }
      }
    );
  }

  // ===== CHẶN GỬI ẢNH / CHAT LUNG TUNG =====
  if (msg.text || msg.photo || msg.video || msg.document) {
    return bot.sendMessage(
      chatId,
      "❌ *Không thể gửi tin nhắn ở đây.*\n" +
        "👉 Hãy gửi sản phẩm đã hoàn thành cho *@thuylinhnei*",
      { parse_mode: "Markdown" }
    );
  }
});

console.log("✅ Bot is running...");