const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("BOT_TOKEN is missing");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// ====== CONFIG ======
const ADMIN_CHAT_ID = 123456789; // <-- thay ID của @thuylinhnei

// Lưu trạng thái user đang làm nhiệm vụ nào
const userTask = {};

// ===== /start =====
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    "🎉 *Chào Mừng CTV mới đến với BOT của Thuỳ Linh!* 🎉\n\n" +
      "👉 Chỉ làm theo nhiệm vụ\n" +
      "👉 *CHỈ GỬI ẢNH – KHÔNG GỬI TEXT*\n\n" +
      "Hoàn thành đủ 3 nhiệm vụ bấm *Đã xong* ❤️",
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

// ===== TASK TEXT =====
const tasks = {
  "📌 Nhiệm vụ 1": `🔥 *NV1: Tham Gia Các Hội Nhóm*
💰 *CÔNG: 20K*

🤖 BOT 1: [Nhấn vào đây](https://t.me/Kiemtien8989_bot?start=r03486044000)

📌 Hoàn thành xong → gửi *ẢNH* vào bot`,

  "📌 Nhiệm vụ 2": {
    text: `🔥 *NV2: CÔNG VIỆC TRÊN THREAD*

💰 1 CMT = 5K  
📌 Đủ 20 CMT là rút lương

⬇️ Bấm nút bên dưới để xem hướng dẫn`,
    url: "https://t.me/thuylinhnei1/38"
  },

  "📌 Nhiệm vụ 3": {
    text: `🔥 *NV3: CÔNG VIỆC TRÊN TIKTOK*

💰 1 CMT = 5K  
📌 Đủ 20 CMT là rút lương

⬇️ Bấm nút bên dưới để xem hướng dẫn`,
    url: "https://t.me/thuylinhnei1/42"
  }
};

// ===== MESSAGE HANDLER =====
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // ===== NÚT ĐÃ XONG =====
  if (text === "✅ Đã xong") {
    return bot.sendMessage(
      chatId,
      "🎉 *Chúc mừng bạn đã hoàn thành đủ 3 nhiệm vụ!*\n\n" +
        "👉 Bây giờ hãy gửi đầy đủ sản phẩm cho Thuỳ Linh\n\n" +
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

  // ===== CLICK NHIỆM VỤ =====
  if (tasks[text]) {
    userTask[chatId] = text;

    if (typeof tasks[text] === "string") {
      return bot.sendMessage(chatId, tasks[text], { parse_mode: "Markdown" });
    } else {
      return bot.sendMessage(chatId, tasks[text].text, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "Bấm vào đây", url: tasks[text].url }]]
        }
      });
    }
  }

  // ===== CHỈ CHO GỬI ẢNH =====
  if (msg.photo) {
    const taskName = userTask[chatId] || "CHƯA CHỌN NHIỆM VỤ";

    await bot.sendMessage(chatId, "✅ Đã nhận ảnh minh chứng");

    await bot.sendMessage(
      ADMIN_CHAT_ID,
      `📥 *NHẬN ẢNH MỚI*\n\n👤 User: ${msg.from.first_name}\n🆔 ID: ${chatId}\n📌 Nhiệm vụ: *${taskName}*`,
      { parse_mode: "Markdown" }
    );

    return bot.forwardMessage(ADMIN_CHAT_ID, chatId, msg.message_id);
  }

  // ===== CẤM TEXT =====
  if (text && !tasks[text]) {
    return bot.sendMessage(
      chatId,
      "❌ *Không thể gửi tin nhắn ở đây*\n\n" +
        "👉 Chỉ gửi *ẢNH minh chứng*\n" +
        "👉 Gửi sản phẩm hoàn thành cho *@thuylinhnei*",
      { parse_mode: "Markdown" }
    );
  }
});

console.log("✅ Bot đang chạy ổn định...");