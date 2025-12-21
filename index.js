const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

// ===== EXPRESS giữ bot sống =====
const app = express();
app.get("/", (req, res) => res.send("Bot is running"));
app.listen(process.env.PORT || 3000);

// ===== TELEGRAM BOT =====
const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("BOT_TOKEN is missing");
  process.exit(1);
}

// ⚠️ CHỈ polling 1 LẦN
const bot = new TelegramBot(token, { polling: true });

// ===== ADMIN ID =====
const ADMIN_ID = 1913597752;

// ===== LƯU TRẠNG THÁI USER =====
/*
 userState = {
   chatId: {
     task: "📌 Nhiệm vụ 1" | "📌 Nhiệm vụ 2" | "📌 Nhiệm vụ 3"
   }
 }
*/
const userState = {};

// ===== /start =====
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
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

// ===== NHIỆM VỤ (GIỮ NGUYÊN TEXT CỦA BẠN) =====
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
    url: "https://t.me/thuylinhnei1/38"
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
    url: "https://t.me/thuylinhnei1/42"
  }
};

// ===== XỬ LÝ MESSAGE =====
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "/start") return;

  // ===== CHỌN NHIỆM VỤ =====
  if (tasks[text]) {
    userState[chatId] = { task: text };

    const task = tasks[text];
    if (typeof task === "string") {
      return bot.sendMessage(
        chatId,
        task + "\n\n📸 *Hoàn thành xong vui lòng GỬI ẢNH minh chứng*",
        { parse_mode: "Markdown" }
      );
    } else {
      return bot.sendMessage(
        chatId,
        task.text + "\n\n📸 *Hoàn thành xong vui lòng GỬI ẢNH minh chứng*",
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [[{ text: "Bấm vào đây", url: task.url }]]
          }
        }
      );
    }
  }

  // ===== NÚT ĐÃ XONG =====
  if (text === "✅ Đã xong") {
    return bot.sendMessage(
      chatId,
      "🎉 *Chúc mừng bạn đã hoàn thành đủ 3 Nhiệm Vụ*\n\n" +
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
  }

  // ===== NHẬN ẢNH MINH CHỨNG =====
  if (msg.photo) {
    const state = userState[chatId];
    if (!state) {
      return bot.sendMessage(
        chatId,
        "❌ Bạn chưa chọn nhiệm vụ.\n👉 Vui lòng chọn nhiệm vụ trước."
      );
    }

    const caption =
      `📥 *BÁO CÁO HOÀN THÀNH*\n\n` +
      `👤 User: ${msg.from.first_name || ""}\n` +
      `🆔 ID: ${chatId}\n` +
      `📌 Nhiệm vụ: ${state.task}`;

    await bot.sendPhoto(
      ADMIN_ID,
      msg.photo[msg.photo.length - 1].file_id,
      { caption, parse_mode: "Markdown" }
    );

    delete userState[chatId];

    return bot.sendMessage(
      chatId,
      "✅ *Đã ghi nhận ảnh hoàn thành.*\n👉 Tiếp tục làm nhiệm vụ tiếp theo.",
      { parse_mode: "Markdown" }
    );
  }

  // ===== CẤM GỬI TEXT =====
  return bot.sendMessage(
    chatId,
    "❌ *Không thể gửi tin nhắn ở đây.*\n👉 Hãy gửi ẢNH hoàn thành nhiệm vụ hoặc nhắn cho @thuylinhnei",
    { parse_mode: "Markdown" }
  );
});

console.log("Bot running ổn định");