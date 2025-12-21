const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

// ===== EXPRESS giữ bot sống =====
const app = express();
app.get("/", (req, res) => res.send("Bot is running"));
app.listen(process.env.PORT || 3000);

// ===== TELEGRAM =====
const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("BOT_TOKEN is missing");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// ===== ADMIN ID =====
const ADMIN_ID = 1913597752;

// ===== LƯU TRẠNG THÁI USER =====
const userTask = {};      // userId -> nhiệm vụ
const userImages = {};   // userId -> { nv2: number, nv3: number }

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

// ===== NHIỆM VỤ (GIỮ NGUYÊN NỘI DUNG) =====
const tasks = {
  "📌 Nhiệm vụ 1": `🔥 *NV1: Tham Gia Các Hội Nhóm*  
💰 *CÔNG: 20K*

🤖 BOT 1: [Nhấn vào đây](https://t.me/Kiemtien8989_bot?start=r03486044000)

📌 *Cách làm:*
- Nhấp vào tất cả kênh / nhóm
- Ấn Join hoặc Mute tham gia hết
- Quay lại bot sau khi hoàn thành

➡️ *Hoàn thành xong ấn sang Nhiệm Vụ 2*`,

  "📌 Nhiệm vụ 2": {
    text: `🔥 *NV2: CÔNG VIỆC TRÊN THREAD*

📌 *Cách làm:*
- Lên Thread
- Bình luận & gửi hình ảnh
- Chụp màn hình lúc đã CMT

💰 *Thu nhập:*
- 1 CMT = 5K
- Đủ 20 CMT là rút lương
- ❌ Không giới hạn
- CMT càng nhiều → thu nhập càng cao

👇 *Bấm nút bên dưới để xem hướng dẫn & lấy ảnh*`,
    url: "https://t.me/thuylinhnei1/38"
  },

  "📌 Nhiệm vụ 3": {
    text: `🔥 *NV3: CÔNG VIỆC TRÊN TIKTOK*

📌 *Cách làm:*
- Search: Tuyển dụng / MMO / Kiếm tiền
- Comment REP người tìm việc
- Chụp màn hình lúc đã CMT

💰 *Thu nhập:*
- 1 CMT = 5K
- Đủ 20 CMT là rút lương
- ❌ Không giới hạn
- CMT càng nhiều → thu nhập càng cao

👇 *Bấm nút bên dưới để xem hướng dẫn & lấy ảnh*`,
    url: "https://t.me/thuylinhnei1/42"
  }
};

// ===== XỬ LÝ MESSAGE =====
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;

  if (text === "/start") return;

  // ===== CHỌN NHIỆM VỤ =====
  if (tasks[text]) {
    userTask[userId] = text;

    if (!userImages[userId]) {
      userImages[userId] = { nv2: 0, nv3: 0 };
    }

    const task = tasks[text];
    if (typeof task === "string") {
      return bot.sendMessage(chatId, task, { parse_mode: "Markdown" });
    } else {
      return bot.sendMessage(chatId, task.text, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "Bấm vào đây", url: task.url }]]
        }
      });
    }
  }

  // ===== NÚT ĐÃ XONG =====
  if (text === "✅ Đã xong") {
    return bot.sendMessage(
      chatId,
      "🎉 *Chúc mừng bạn đã hoàn thành đủ 3 nhiệm vụ!*\n\n" +
      "👉 Giờ hãy nhắn cho Thuỳ Linh gửi đủ sản phẩm đã làm",
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

  // ===== CHỈ NHẬN ẢNH =====
  if (!msg.photo) {
    return bot.sendMessage(
      chatId,
      "❌ Không thể gửi tin nhắn ở đây.\n👉 Hãy gửi *HÌNH ẢNH* sản phẩm đã hoàn thành cho @thuylinhnei",
      { parse_mode: "Markdown" }
    );
  }

  // ===== XỬ LÝ ẢNH =====
  const currentTask = userTask[userId];

  if (!currentTask) {
    return bot.sendMessage(chatId, "⚠️ Vui lòng chọn nhiệm vụ trước khi gửi ảnh.");
  }

  // Forward ảnh cho admin
  await bot.forwardMessage(ADMIN_ID, chatId, msg.message_id);

  // NV2
  if (currentTask === "📌 Nhiệm vụ 2") {
    userImages[userId].nv2++;
    const count = userImages[userId].nv2;

    if (count < 20) {
      return bot.sendMessage(chatId, `📸 Đã nhận ${count}/20 ảnh. Vui lòng gửi tiếp.`);
    } else {
      return bot.sendMessage(chatId, "✅ Bạn đã hoàn thành *Nhiệm vụ 2*. Hãy sang Nhiệm vụ 3.");
    }
  }

  // NV3
  if (currentTask === "📌 Nhiệm vụ 3") {
    userImages[userId].nv3++;
    const count = userImages[userId].nv3;

    if (count < 20) {
      return bot.sendMessage(chatId, `📸 Đã nhận ${count}/20 ảnh. Vui lòng gửi tiếp.`);
    } else {
      return bot.sendMessage(chatId, "✅ Bạn đã hoàn thành *Nhiệm vụ 3*. Bấm **Đã xong**.");
    }
  }

  // NV1 chỉ cần ảnh xác nhận
  if (currentTask === "📌 Nhiệm vụ 1") {
    return bot.sendMessage(chatId, "✅ Đã nhận ảnh Nhiệm vụ 1. Hãy sang Nhiệm vụ 2.");
  }
});

console.log("Bot chạy OK");