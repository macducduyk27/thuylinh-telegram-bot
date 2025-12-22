const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

// ===== WEB KEEP ALIVE =====
const app = express();
app.get("/", (req, res) => res.send("Bot is running"));
app.listen(process.env.PORT || 3000);

// ===== BOT =====
const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("BOT_TOKEN missing");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// ===== ADMIN =====
const ADMIN_ID = 1913597752;

// ===== BAN =====
const bannedUsers = new Set();

// ===== USER STATE =====
const userState = {};
// userState[userId] = { task, photos, paidNV1 }

// ===== USER BALANCE =====
const userBalance = {};
// userBalance[userId] = number

// ===== /BAN /UNBAN =====
bot.onText(/\/ban (\d+)/, (msg, match) => {
  if (msg.chat.id !== ADMIN_ID) return;
  bannedUsers.add(Number(match[1]));
  bot.sendMessage(msg.chat.id, "✅ Đã ban user");
});

bot.onText(/\/unban (\d+)/, (msg, match) => {
  if (msg.chat.id !== ADMIN_ID) return;
  bannedUsers.delete(Number(match[1]));
  bot.sendMessage(msg.chat.id, "✅ Đã unban user");
});

// ===== /START =====
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  if (bannedUsers.has(chatId)) {
    return bot.sendMessage(chatId, "❌ Bạn đã bị cấm sử dụng bot.");
  }

  userState[chatId] = { task: 0, photos: 0, paidNV1: false };
  userBalance[chatId] = userBalance[chatId] || 0;

  bot.sendMessage(
    chatId,
    "🎉 *Chào Mừng CTV mới đến với BOT của Thuỳ Linh!* 🎉\n\n" +
      "Các bạn ấn vào các nhiệm vụ dưới đây để hoàn thành rồi gửi ảnh đã hoàn thành vào BOT luôn. Chúc các bạn làm việc thật thành công ❤️",
    {
      parse_mode: "Markdown",
      reply_markup: {
        keyboard: [
          [{ text: "📌 Nhiệm vụ 1" }],
          [{ text: "📌 Nhiệm vụ 2" }],
          [{ text: "📌 Nhiệm vụ 3" }],
          [{ text: "✅ Đã xong" }],
          [{ text: "💰 Số dư" }, { text: "🏧 Rút tiền" }]
        ],
        resize_keyboard: true
      }
    }
  );
});

// ===== TASKS (GIỮ NGUYÊN 100%) =====
const tasks = {
  "📌 Nhiệm vụ 1": `🔥 *NV1: Tham Gia Các Hội Nhóm*  
💰 *CÔNG: 20K*

🤖 BOT 1: [Nhấn vào đây](https://t.me/Kiemtien8989_bot?start=r03486044000)

📌 *Cách làm:*
- Nhấp vào tất cả kênh / nhóm
- Ấn Join hoặc Mute tham gia hết
- Quay lại bot sau khi hoàn thành

⚠️ *LƯU Ý:*  
Phải hiện: _invited by user Thuỳ Linh_ mới được em nhé ✅

➡️ Hoàn thành xong hãy gửi hình ảnh hoàn thành nhiệm vụ`,

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

Sau khi hoàn thành xong chụp đủ ít nhất 20 ảnh để tiếp tục
⬇️ Bấm nút bên dưới để xem hướng dẫn và lấy ảnh`,
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
- CMT càng nhiều → thu nhập càng cao

Sau khi hoàn thành xong chụp đủ ít nhất 20 ảnh để tiếp tục
⬇️ Bấm nút bên dưới để xem hướng dẫn và lấy ảnh`,
    url: "https://t.me/thuylinhnei1/42"
  }
};

// ===== MESSAGE =====
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const user = msg.from;

  if (bannedUsers.has(chatId)) return;

  if (!userState[chatId]) {
    userState[chatId] = { task: 0, photos: 0, paidNV1: false };
    userBalance[chatId] = userBalance[chatId] || 0;
  }

  const state = userState[chatId];

  // ===== SỐ DƯ =====
  if (text === "💰 Số dư") {
    return bot.sendMessage(
      chatId,
      `💰 Số dư hiện tại: ${userBalance[chatId].toLocaleString()}đ`
    );
  }

  // ===== RÚT TIỀN =====
  if (text === "🏧 Rút tiền") {
    return bot.sendMessage(
      chatId,
      "🏧 *YÊU CẦU RÚT TIỀN*\n\n👉 Vui lòng nhắn trực tiếp cho Thuỳ Linh để được xử lý.",
      { parse_mode: "Markdown" }
    );
  }

  // ===== CHỌN NHIỆM VỤ =====
  if (tasks[text]) {
    state.task = text.includes("1") ? 1 : text.includes("2") ? 2 : 3;
    state.photos = 0;

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

  // ===== NHẬN ẢNH =====
  if (msg.photo) {
    state.photos++;

    let earn = 0;

    // NV1 chỉ ăn 20K DUY NHẤT
    if (state.task === 1 && !state.paidNV1) {
      earn = 20000;
      state.paidNV1 = true;
    }

    // NV2 & NV3
    if (state.task === 2 || state.task === 3) {
      earn = 5000;
    }

    userBalance[chatId] += earn;

    await bot.sendMessage(
      ADMIN_ID,
      `📥 BÁO CÁO\n\n👤 ${user.first_name}\n🆔 ID: ${chatId}\n📌 NV: ${state.task}\n💰 +${earn.toLocaleString()}đ | Tổng: ${userBalance[chatId].toLocaleString()}đ`
    );

    await bot.forwardMessage(ADMIN_ID, chatId, msg.message_id);

    return bot.sendMessage(
      chatId,
      `📸 Đã nhận ảnh\n💰 +${earn.toLocaleString()}đ | Số dư: ${userBalance[
        chatId
      ].toLocaleString()}đ`
    );
  }
});

console.log("BOT RUNNING OK");