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

// ===== DANH SÁCH NGƯỜI BỊ BAN =====
const bannedUsers = new Set();

// ===== LƯU TRẠNG THÁI USER =====
const userState = {};
// userState[userId] = { task: 0|1|2|3, photos: number, earned: number }

// ===== LỆNH BAN / UNBAN =====
bot.onText(/\/ban (\d+)/, (msg, match) => {
  if (msg.from.id !== ADMIN_ID) return; // chỉ admin mới được ban

  const userIdToBan = parseInt(match[1]);
  bannedUsers.add(userIdToBan);
  bot.sendMessage(msg.chat.id, `✅ Đã cấm user ID: ${userIdToBan}`);
});

bot.onText(/\/unban (\d+)/, (msg, match) => {
  if (msg.from.id !== ADMIN_ID) return; // chỉ admin mới được unban

  const userIdToUnban = parseInt(match[1]);
  bannedUsers.delete(userIdToUnban);
  bot.sendMessage(msg.chat.id, `✅ Đã bỏ cấm user ID: ${userIdToUnban}`);
});

// ===== LỆNH ADM (THÔNG BÁO TOÀN BOT) =====
bot.onText(/\/adm (.+)/, (msg, match) => {
  if (msg.from.id !== ADMIN_ID) return;

  const content = match[1];
  Object.keys(userState).forEach((uid) => {
    if (!bannedUsers.has(Number(uid))) {
      bot.sendMessage(uid, `📢 Thông báo:\n${content}`);
    }
  });

  bot.sendMessage(msg.chat.id, "✅ Đã gửi thông báo đến toàn bộ CTV");
});

// ===== LỆNH RESET USER =====
bot.onText(/\/reset (\d+)/, (msg, match) => {
  if (msg.from.id !== ADMIN_ID) return;

  const targetId = parseInt(match[1]);
  userState[targetId] = { task: 0, photos: 0, earned: 0 };

  bot.sendMessage(msg.chat.id, `🔄 Đã reset nhiệm vụ cho user ID: ${targetId}`);
  bot.sendMessage(
    targetId,
    "🔄 Nhiệm vụ của bạn đã bị reset. Vui lòng làm lại từ đầu cho đúng yêu cầu."
  );
});

// ===== LỆNH WARN USER =====
bot.onText(/\/warn (\d+)/, (msg, match) => {
  if (msg.from.id !== ADMIN_ID) return;

  const targetId = parseInt(match[1]);
  bot.sendMessage(
    targetId,
    "⚠️ CẢNH CÁO\n\nẢnh bạn gửi không hợp lệ hoặc làm cho có.\nNếu tiếp tục vi phạm sẽ bị BAN khỏi hệ thống."
  );

  bot.sendMessage(msg.chat.id, `⚠️ Đã cảnh cáo user ID: ${targetId}`);
});

// ===== /start =====
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  if (bannedUsers.has(chatId)) {
    return bot.sendMessage(chatId, "❌ Bạn đã bị cấm sử dụng bot này.");
  }

  // Thay đổi ở đây:
  if (!userState[chatId]) userState[chatId] = {
    task: 0,
    photos1: 0,
    photos2: 0,
    photos3: 0,
    earned: 0
  };

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
          [{ text: "💰 Số dư" }, { text: "💸 Rút tiền" }]
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

  let state = userState[chatId];
  if (!state) state = userState[chatId] = { task: 0, photos: 0, earned: 0 };

// ===== XEM SỐ DƯ =====
if (text === "💰 Số dư") {
  let balance = 0;

  // NV1
  if (state.photos1 && state.photos1 > 0) balance += 20000;

  // NV2
  if (state.photos2 && state.photos2 > 0) balance += state.photos2 * 5000;

  // NV3
  if (state.photos3 && state.photos3 > 0) balance += state.photos3 * 5000;

  return bot.sendMessage(chatId, `💰 Số dư hiện tại của bạn: ${balance.toLocaleString()} VND`);
}

  // ===== RÚT TIỀN =====
  if (text === "💸 Rút tiền") {
    if (state.task < 3 || 
        (state.task === 2 && state.photos < 20) || 
        (state.task === 3 && state.photos < 20)) {
      return bot.sendMessage(
        chatId,
        "❌ Bạn cần phải hoàn thành xong 3 nhiệm vụ mới được rút tiền."
      );
    }

    return bot.sendMessage(
      chatId,
      "❌ Bạn chưa xác nhận tài khoản. Vui lòng liên hệ @thuylinhnei để xác nhận tài khoản để được rút tiền."
    );
  }

  // ===== KIỂM TRA BAN =====
  if (bannedUsers.has(chatId)) {
    return bot.sendMessage(chatId, "❌ Bạn đã bị cấm sử dụng bot này.");
  }

  // ===== NÚT "ĐÃ XONG" =====
  if (text === "✅ Đã xong") {
    if (
      state.task < 3 ||
      (state.task === 2 && state.photos < 20) ||
      (state.task === 3 && state.photos < 20)
    ) {
      return bot.sendMessage(
        chatId,
        "❌ Bạn chưa hoàn thành đủ 3 nhiệm vụ. Vui lòng hoàn thành trước khi nhấn 'Đã xong'."
      );
    }
    return bot.sendMessage(
      chatId,
      "🎉 Chúc mừng bạn đã hoàn thành đủ 3 nhiệm vụ!\n" +
      "⬇️ Bấm nút bên dưới để xem hướng dẫn và lấy ảnh\n" +
      "👉 Giờ hãy nhắn cho Thuỳ Linh để báo cáo đã hoàn thành xong công việc",
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "Ấn vào đây", url: "https://t.me/thuylinhnei" }]]
        }
      }
    );
  }

 // ===== CHỌN NHIỆM VỤ =====
  if (tasks[text]) {
    const taskNum = text.includes("1") ? 1 : text.includes("2") ? 2 : 3;

    if (taskNum === 2 && (state.task < 1 || state.photos < 1)) {
      return bot.sendMessage(
        chatId,
        "❌ Bạn chưa gửi đủ 1 ảnh của Nhiệm vụ 1. Vui lòng hoàn thành trước khi qua NV2."
      );
    }

    if (taskNum === 3 && (state.task < 2 || state.photos < 20)) {
      return bot.sendMessage(
        chatId,
        "❌ Bạn chưa hoàn thành đủ 20 ảnh của Nhiệm vụ 2. Vui lòng hoàn thành trước khi qua NV3."
      );
    }

    state.task = taskNum;
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

  // ===== NHẬN ẢNH (CẬP NHẬT THU NHẬP) =====
if (msg.photo) {
  if (!state.task) return;

  let earnedThisPhoto = 0;

  if (state.task === 1) {
    state.photos1 = 1;
    earnedThisPhoto = 20000;
  } else if (state.task === 2) {
    state.photos2 = (state.photos2 || 0) + 1;
    earnedThisPhoto = 5000;
  } else if (state.task === 3) {
    state.photos3 = (state.photos3 || 0) + 1;
    earnedThisPhoto = 5000;
  }

  // Tính tổng số dư
  state.earned = (state.photos1 ? 20000 : 0) +
                 (state.photos2 || 0) * 5000 +
                 (state.photos3 || 0) * 5000;

  // báo cáo admin
  await bot.sendMessage(
    ADMIN_ID,
    `📥 BÁO CÁO HOÀN THÀNH\n\n` +
      `👤 User: ${msg.from.first_name || ""}\n` +
      `🆔 ID: ${chatId}\n` +
      `📌 Nhiệm vụ: Nhiệm vụ ${state.task}\n` +
      `📷 Ảnh NV1: ${state.photos1 || 0}/1\n` +
      `📷 Ảnh NV2: ${state.photos2 || 0}/20\n` +
      `📷 Ảnh NV3: ${state.photos3 || 0}/20\n` +
      `💰 Thu nhập hiện tại: ${state.earned.toLocaleString()} VND`
  );

  await bot.forwardMessage(ADMIN_ID, chatId, msg.message_id);

  // thông báo user
  if (state.task === 1) {
    return bot.sendMessage(
      chatId,
      `🎉 Chúc mừng bạn đã hoàn thành nhiệm vụ 1! +${earnedThisPhoto.toLocaleString()} VND\nVui lòng bấm sang nhiệm vụ 2 để làm tiếp.\nTổng số dư: ${state.earned.toLocaleString()} VND`
    );
  } else if (state.task === 2 || state.task === 3) {
    const maxPhotos = 20;
    const photos = state.task === 2 ? state.photos2 : state.photos3;

    if (photos < maxPhotos) {
      return bot.sendMessage(
        chatId,
        `📸 Đã nhận ${photos}/${maxPhotos} ảnh. Vui lòng gửi tiếp.\n+${earnedThisPhoto.toLocaleString()} VND. Số dư: ${state.earned.toLocaleString()} VND`
      );
    } else {
      return bot.sendMessage(
        chatId,
        `🎉 Chúc mừng bạn đã hoàn thành nhiệm vụ này!\n+${earnedThisPhoto.toLocaleString()} VND. Số dư: ${state.earned.toLocaleString()} VND\nNếu muốn làm thêm gửi thêm ảnh để thêm thu nhập thì cứ tiếp tục tôi sẽ thanh toán đầy đủ cho bạn.`
      );
    }
  }
}

  // ===== CHẶN TEXT KHÁC =====
  return bot.sendMessage(
    chatId,
    "❌ Không thể gửi tin nhắn ở đây.\n👉 Hãy gửi ảnh hoàn thành nhiệm vụ ở đây. Có gì không hiểu vui lòng liên hệ @thuylinhnei để được giải đáp."
  );
});

console.log("BOT RUNNING OK");