const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

// ===== EXPRESS =====
const app = express();
app.get("/", (req, res) => res.send("Bot is running"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Web running"));

// ===== TELEGRAM =====
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// ===== ADMIN ID =====
const ADMIN_ID = 1913597752;

// ===== DATA LƯU TẠM =====
const userData = {}; 
// userData[userId] = { step: 1|2|3, nv2Count: 0, nv3Count: 0 }

// ===== /start =====
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  userData[chatId] = { step: 1, nv2Count: 0, nv3Count: 0 };

  bot.sendMessage(
    chatId,
    "🎉 *Chào Mừng CTV mới đến với BOT của Thuỳ Linh!* 🎉\n" +
    "Các bạn ấn vào các nhiệm vụ dưới đây để hoàn thành rồi gửi ảnh đã hoàn thành vào BOT luôn.\n" +
    "Chúc các bạn làm việc thật thành công ❤️",
    {
      parse_mode: "Markdown",
      reply_markup: {
        keyboard: [
          ["📌 Nhiệm vụ 1"],
          ["📌 Nhiệm vụ 2"],
          ["📌 Nhiệm vụ 3"],
          ["✅ Đã xong"]
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

➡️ *Hoàn thành xong hãy gửi hình ảnh hoàn thành nhiệm vụ*`,

  "📌 Nhiệm vụ 2": `🔥 *NV2: CÔNG VIỆC TRÊN THREAD*

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

  "📌 Nhiệm vụ 3": `🔥 *NV3: CÔNG VIỆC TRÊN TIKTOK*

📌 *Cách làm:*
- Search: Tuyển dụng / MMO / Kiếm tiền
- Comment REP người tìm việc
- Chụp màn hình lúc đã CMT

💰 *Thu nhập:*
- 1 CMT = 5K
- Đủ 20 CMT là rút lương
- ❌ Không giới hạn
- CMT càng nhiều → thu nhập càng cao

Sau khi hoàn thành xong chụp đủ ít nhất 20 ảnh để tiếp tục`
};

// ===== MESSAGE =====
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!userData[chatId]) return;

  // ===== BẤM NHIỆM VỤ =====
  if (tasks[text]) {
    if (text === "📌 Nhiệm vụ 2" && userData[chatId].step < 2) {
      return bot.sendMessage(chatId, "❌ Bạn cần hoàn thành Nhiệm vụ 1 trước.");
    }

    if (text === "📌 Nhiệm vụ 3" && userData[chatId].step < 3) {
      return bot.sendMessage(chatId, "❌ Bạn cần hoàn thành đủ 20 ảnh Nhiệm vụ 2 trước.");
    }

    return bot.sendMessage(chatId, tasks[text], { parse_mode: "Markdown" });
  }

  // ===== GỬI ẢNH =====
  if (msg.photo) {
    const u = userData[chatId];

    if (u.step === 1) {
      u.step = 2;
      bot.sendMessage(chatId, "✅ Đã nhận ảnh hoàn thành Nhiệm vụ 1. Tiếp tục Nhiệm vụ 2.");
    } 
    else if (u.step === 2) {
      u.nv2Count++;
      if (u.nv2Count >= 20) {
        u.step = 3;
        bot.sendMessage(chatId,
          "🎉 Chúc mừng bạn đã hoàn thành nhiệm vụ.\n" +
          "Nếu bạn vẫn muốn làm thêm gửi thêm ảnh để thêm thu nhập thì cứ tiếp tục tôi sẽ thanh toán đủ cho bạn."
        );
      } else {
        bot.sendMessage(chatId, `📸 Đã nhận ${u.nv2Count}/20 ảnh nhiệm vụ 2`);
      }
    } 
    else if (u.step === 3) {
      u.nv3Count++;
      if (u.nv3Count >= 20) {
        bot.sendMessage(chatId,
          "🎉 Chúc mừng bạn đã hoàn thành nhiệm vụ.\n" +
          "Nếu bạn vẫn muốn làm thêm gửi thêm ảnh để thêm thu nhập thì cứ tiếp tục tôi sẽ thanh toán đủ cho bạn."
        );
      } else {
        bot.sendMessage(chatId, `📸 Đã nhận ${u.nv3Count}/20 ảnh nhiệm vụ 3`);
      }
    }

    // forward cho admin
    bot.forwardMessage(ADMIN_ID, chatId, msg.message_id);
    return;
  }

  // ===== ĐÃ XONG =====
  if (text === "✅ Đã xong") {
    return bot.sendMessage(
      chatId,
      "🎉 Chúc mừng bạn đã hoàn thành đủ 3 nhiệm vụ!\n" +
      "👉 Giờ hãy nhắn cho Thuỳ Linh để báo cáo đã hoàn thành xong công việc"
    );
  }

  // ===== CẤM TEXT =====
  bot.sendMessage(
    chatId,
    "❌ Không thể gửi tin nhắn ở đây.\n" +
    "👉 Hãy gửi ảnh hoàn thành nhiệm vụ ở đây. Có gì không hiểu vui lòng liên hệ @thuylinhnei để được giải đáp."
  );
});

console.log("Bot chạy ổn định");