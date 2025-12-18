const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("BOT_TOKEN is missing");
  process.exit(1);
}

// Tạo bot và fix 409 Conflict
const bot = new TelegramBot(token);
bot.stopPolling();
bot.startPolling();

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
          [{ text: "📌 Nhiệm vụ 3" }]
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

⚠️ *LƯU Ý:*  
Phải hiện: _invited by user Thuỳ Linh_ mới được em nhé ✅`,

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
- CMT càng nhiều → thu nhập càng cao`,
    button: { text: "Bấm vào đây", url: "https://t.me/thuylinhnei1/38" }
  },

  "📌 Nhiệm vụ 3": {
    text: `🔥 *NV3: CÔNG VIỆC TRÊN TIKTOK*

📌 *Cách CMT trên TikTok:*
- Search trên thanh tìm kiếm (Tuyển dụng, MMO, Kiếm tiền online,...)
- Ấn vào 1 clip bất kì, comment REP CMT của người tìm việc (MỚI NHẤT)  
- Chụp màn hình lúc đã CMT

💰 *Thu nhập:*
- 1 CMT = 5K
- Đủ 20 CMT là được rút lương
- ❌ KHÔNG GIỚI HẠN số lượng
- CMT càng nhiều → thu nhập càng cao`,
    button: { text: "Bấm vào đây", url: "https://t.me/thuylinhnei1/42" }
  }
};

// ===== XỬ LÝ TIN NHẮN =====
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  console.log("Received message:", text || "photo");

  if (!text && !msg.photo) return;
  if (text === "/start") return;

  // Nếu tin nhắn là nhiệm vụ
  if (tasks[text]) {
    const task = tasks[text];
    if (typeof task === "string") {
      // NV1 giữ nguyên, chỉ gửi text
      await bot.sendMessage(chatId, task, { parse_mode: "Markdown" });
    } else {
      // NV2 và NV3 có button
      await bot.sendMessage(chatId, task.text, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: task.button.text, url: task.button.url }]]
        }
      });
    }
    return;
  }

  // Xử lý hình ảnh minh chứng
  if (msg.photo) {
    await bot.sendMessage(
      chatId,
      "✅ Không gửi hình ảnh ở đây. Bạn nhớ gửi ảnh về @thuylinhnei để được trả công nhé! Không gửi ảnh ở đây "
    );

    const adminChatId = 123456789; // <-- Thay bằng chat ID số của @thuylinhnei
    bot.forwardMessage(adminChatId, chatId, msg.message_id);

    return;
  }

  // Tin nhắn không hợp lệ
  await bot.sendMessage(
    chatId,
    "❌ Mình không hiểu tin nhắn của bạn. Vui lòng chọn nhiệm vụ hoặc gửi hình ảnh minh chứng cho @thuylinhnei ."
  );
});

console.log("Bot is running...");