const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("BOT_TOKEN is missing");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// ===== /start =====
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    "🎉 *Chào mừng bạn đến với BOT THUỲ LINH* 🎉\n\n" +
    "📌 *BẠN VUI LÒNG HOÀN THÀNH CÁC NHIỆM VỤ DƯỚI ĐÂY*\n" +
    "📌 Sau khi hoàn thành, gửi kết quả về *@thuylinhnei*\n\n" +
    "⬇️⬇️⬇️ *CÁC NHIỆM VỤ BÊN DƯỚI* ⬇️⬇️⬇️",
    {
      parse_mode: "Markdown",
      reply_markup: {
        keyboard: [
          [{ text: "📌 Nhiệm vụ 1" }],
          [{ text: "📌 Nhiệm vụ 2" }]
        ],
        resize_keyboard: true
      }
    }
  );
});

// ===== NHIỆM VỤ =====
const tasks = {
  "📌 Nhiệm vụ 1": `🔥 *NV1: Tham Gia Các Hội Nhóm*  
💰 *CÔNG: 50K*

🤖 BOT 1:
https://t.me/Kiemtien8989_bot?start=r03486044000

📌 *Cách làm:*
- Nhấp vào tất cả kênh / nhóm
- Ấn Join hoặc Mute tham gia hết
- Quay lại bot sau khi hoàn thành

⚠️ *LƯU Ý:*  
Phải hiện: _invited by user Thuỳ Linh_ mới được em nhé ✅`,

  "📌 Nhiệm vụ 2": `🔥 *NV2: KIẾM TIỀN COMMENT THREAD*

📌 *Cách làm:*
- Lên Thread
- Bình luận và gửi hình ảnh dưới các post
- Chụp màn hình lúc đã CMT

💰 *Thu nhập:*
- 1 CMT = *5K*
- Đủ *10 CMT* là được rút lương
- ❌ *KHÔNG GIỚI HẠN* số lượng
- CMT càng nhiều → thu nhập càng cao

📸 Làm xong gửi hình ảnh minh chứng để được duyệt nhé 💖`
};

// ===== XỬ LÝ TIN NHẮN =====
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return;
  if (text === "/start") return;

  // Nếu tin nhắn là nhiệm vụ
  if (tasks[text]) {
    await bot.sendMessage(chatId, tasks[text], { parse_mode: "Markdown" });
    return;
  }

  // Xử lý hình ảnh minh chứng cho NV2
  if (msg.photo) {
    // Lấy ảnh lớn nhất
    const photo = msg.photo[msg.photo.length - 1];
    const fileId = photo.file_id;

    await bot.sendMessage(
      chatId,
      "✅ Hình ảnh minh chứng đã được gửi. Bạn nhớ gửi về @thuylinhnei để được duyệt nhé!"
    );

    // Forward ảnh về admin
    const adminChatId = "@thuylinhnei"; // hoặc ID số
    bot.forwardMessage(adminChatId, chatId, msg.message_id);

    return;
  }
});

console.log("Bot is running...");