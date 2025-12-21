const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

// ===== EXPRESS (giữ bot sống) =====
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
const userState = {}; 
// userState[userId] = { nv2: số ảnh, nv3: số ảnh }

// ===== /start =====
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  userState[chatId] = { nv2: 0, nv3: 0 };

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

// ===== NHIỆM VỤ (GIỮ NGUYÊN TEXT) =====
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
- Bình luận & gửi hình ảnh
- Chụp màn hình lúc đã CMT

💰 *Thu nhập:*
- 1 CMT = 5K
- Đủ 20 CMT là rút lương
- ❌ Không giới hạn
- CMT càng nhiều → thu nhập càng cao

Sau khi hoàn thành xong chụp đủ ít nhất 20 ảnh để tiếp tục`,
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

Sau khi hoàn thành xong chụp đủ ít nhất 20 ảnh để tiếp tục`,
    url: "https://t.me/thuylinhnei1/42"
  }
};

// ===== XỬ LÝ MESSAGE =====
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!userState[chatId]) {
    userState[chatId] = { nv2: 0, nv3: 0 };
  }

  // ===== ẤN NHIỆM VỤ =====
  if (tasks[text]) {
    if (text === "📌 Nhiệm vụ 3" && userState[chatId].nv2 < 20) {
      return bot.sendMessage(
        chatId,
        "❌ Bạn phải hoàn thành *đủ 20 ảnh Nhiệm vụ 2* mới được làm Nhiệm vụ 3.",
        { parse_mode: "Markdown" }
      );
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

  // ===== GỬI ẢNH =====
  if (msg.photo) {
    if (userState[chatId].nv2 < 20) {
      userState[chatId].nv2++;
      bot.forwardMessage(ADMIN_ID, chatId, msg.message_id);
      return bot.sendMessage(
        chatId,
        `📸 NV2: Đã nhận ${userState[chatId].nv2}/20 ảnh`
      );
    }

    if (userState[chatId].nv3 < 20) {
      userState[chatId].nv3++;
      bot.forwardMessage(ADMIN_ID, chatId, msg.message_id);
      return bot.sendMessage(
        chatId,
        `📸 NV3: Đã nhận ${userState[chatId].nv3}/20 ảnh`
      );
    }

    return;
  }

  // ===== ĐÃ XONG =====
  if (text === "✅ Đã xong") {
    if (userState[chatId].nv2 < 20 || userState[chatId].nv3 < 20) {
      return bot.sendMessage(
        chatId,
        "❌ Bạn chưa hoàn thành đủ ảnh NV2 & NV3.",
        { parse_mode: "Markdown" }
      );
    }

    return bot.sendMessage(
      chatId,
      "🎉 *Chúc mừng bạn đã hoàn thành đủ 3 nhiệm vụ!*\n\n👉 Gửi sản phẩm cho Thuỳ Linh",
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "Ấn vào đây", url: "https://t.me/thuylinhnei" }]]
        }
      }
    );
  }

  // ===== CẤM TEXT =====
  return bot.sendMessage(
    chatId,
    "❌ Không thể gửi tin nhắn ở đây.\n👉 Hãy gửi *ảnh hoàn thành* cho @thuylinhnei",
    { parse_mode: "Markdown" }
  );
});

console.log("✅ Bot running ổn định");