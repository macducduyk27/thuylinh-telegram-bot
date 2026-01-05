const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

/* ===== WEB KEEP ALIVE ===== */
const app = express();
app.get("/", (req, res) => res.send("Bot is running"));
app.listen(process.env.PORT || 3000);

/* ===== BOT ===== */
const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("BOT_TOKEN missing");
  process.exit(1);
}
const bot = new TelegramBot(token, { polling: true });

/* ===== ADMIN ===== */
const ADMIN_ID = 1913597752;

/* ===== DATA ===== */
const bannedUsers = new Set();
const userState = {};

/* ===== ADMIN COMMANDS ===== */
bot.onText(/\/ban (\d+)/, (msg, m) => {
  if (msg.from.id !== ADMIN_ID) return;
  bannedUsers.add(Number(m[1]));
  bot.sendMessage(msg.chat.id, "✅ Đã ban user");
});

bot.onText(/\/unban (\d+)/, (msg, m) => {
  if (msg.from.id !== ADMIN_ID) return;
  bannedUsers.delete(Number(m[1]));
  bot.sendMessage(msg.chat.id, "✅ Đã unban user");
});

bot.onText(/\/reset (\d+)/, (msg, m) => {
  if (msg.from.id !== ADMIN_ID) return;
  userState[m[1]] = {
    task: 0,
    photos1: 0,
    photos2: 0,
    photos3: 0,
    earned: 0,
    verified: false,
    withdrawStep: 0
  };
  bot.sendMessage(msg.chat.id, "🔄 Đã reset user");
});

bot.onText(/\/verify (\d+)/, (msg, m) => {
  if (msg.from.id !== ADMIN_ID) return;
  const id = Number(m[1]);
  if (!userState[id]) return;
  userState[id].verified = true;
  bot.sendMessage(id, "🎉 Tài khoản đã được xác nhận, bạn có thể rút tiền");
});

/* ===== /START ===== */
bot.onText(/\/start/, (msg) => {
  const id = msg.chat.id;
  if (!userState[id]) {
    userState[id] = {
      task: 0,
      photos1: 0,
      photos2: 0,
      photos3: 0,
      earned: 0,
      verified: false,
      withdrawStep: 0
    };
  }

  bot.sendMessage(
    id,
    "🎉 Chào mừng CTV đến với BOT Thuỳ Linh",
    {
      reply_markup: {
        keyboard: [
          ["ℹ️ Thông tin cá nhân"],
          ["📌 Nhiệm vụ 1"],
          ["📌 Nhiệm vụ 2"],
          ["📌 Nhiệm vụ 3"],
          ["💰 Số dư", "💸 Rút tiền"]
        ],
        resize_keyboard: true
      }
    }
  );
});

/* ===== MESSAGE ===== */
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const state = userState[chatId];
  if (!state) return;

  if (bannedUsers.has(chatId)) {
    return bot.sendMessage(chatId, "❌ Bạn đã bị cấm");
  }

  /* ===== THÔNG TIN CÁ NHÂN ===== */
  if (text === "ℹ️ Thông tin cá nhân") {
    return bot.sendMessage(
      chatId,
      `👤 ${msg.from.first_name}\n` +
      `🆔 ${chatId}\n` +
      `🔐 ${state.verified ? "Đã xác nhận" : "Chưa xác nhận"}\n\n` +
      `📌 NV1: ${state.photos1}/1\n` +
      `📌 NV2: ${state.photos2}/20\n` +
      `📌 NV3: ${state.photos3}/20\n\n` +
      `💰 ${state.earned.toLocaleString()} VND`
    );
  }

  /* ===== SỐ DƯ ===== */
  if (text === "💰 Số dư") {
    return bot.sendMessage(chatId, `💰 ${state.earned.toLocaleString()} VND`);
  }

  /* ===== RÚT TIỀN ===== */
  if (text === "💸 Rút tiền") {
    if (!state.verified)
      return bot.sendMessage(chatId, "❌ Chưa xác nhận, liên hệ @thuylinhnei");

    if (state.photos1 < 1 || state.photos2 < 20 || state.photos3 < 20)
      return bot.sendMessage(chatId, "❌ Vui lòng hoàn thành đủ 3 nhiệm vụ");

    return bot.sendMessage(chatId, "✅ Đủ điều kiện rút tiền, admin sẽ xử lý");
  }

  /* ===== NHIỆM VỤ ===== */
  if (text === "📌 Nhiệm vụ 1") {
    state.task = 1;
    return bot.sendMessage(chatId, "📌 NV1: gửi 1 ảnh");
  }
  if (text === "📌 Nhiệm vụ 2") {
    if (state.photos1 < 1)
      return bot.sendMessage(chatId, "❌ Hoàn thành NV1 trước");
    state.task = 2;
    return bot.sendMessage(chatId, "📌 NV2: gửi ít nhất 20 ảnh");
  }
  if (text === "📌 Nhiệm vụ 3") {
    if (state.photos2 < 20)
      return bot.sendMessage(chatId, "❌ Hoàn thành NV2 trước");
    state.task = 3;
    return bot.sendMessage(chatId, "📌 NV3: gửi ít nhất 20 ảnh");
  }

  /* ===== NHẬN ẢNH ===== */
  if (msg.photo) {
    if (state.task === 1 && state.photos1 < 1) {
      state.photos1 = 1;
      state.earned += 20000;
    } else if (state.task === 2) {
      state.photos2++;
      state.earned += 5000;
    } else if (state.task === 3) {
      state.photos3++;
      state.earned += 5000;
    }
    return bot.sendMessage(chatId, "📸 Đã nhận ảnh");
  }
});

console.log("BOT RUNNING OK");