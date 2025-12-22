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

// ===== LỆNH ADM DUYỆT RÚT TIỀN =====
bot.onText(/\/ruttien (\d+) (\d+)/, (msg, match) => {
  if (msg.from.id !== ADMIN_ID) return; // chỉ admin mới dùng được

  const userId = parseInt(match[1]);   // ID user
  const amount = parseInt(match[2]);   // số tiền duyệt

  const state = userState[userId];
  if (!state) {
    return bot.sendMessage(msg.chat.id, "❌ User chưa tồn tại hoặc chưa xác nhận.");
  }

  if (amount > state.earned) {
    return bot.sendMessage(msg.chat.id, `❌ User không đủ số dư. Số dư hiện tại: ${state.earned.toLocaleString()} VND`);
  }

  // Trừ tiền
  state.earned -= amount;

  // Thông báo user
  bot.sendMessage(userId, `✅ Yêu cầu rút tiền của bạn đã được admin duyệt.\nSố tiền: ${amount.toLocaleString()} VND\nSố dư còn lại: ${state.earned.toLocaleString()} VND`);

  // Thông báo admin
  bot.sendMessage(msg.chat.id, `✅ Đã duyệt rút tiền cho user ID ${userId}: ${amount.toLocaleString()} VND`);
});

// ===== LỆNH XÁC NHẬN TÀI KHOẢN (VERIFY) =====
bot.onText(/\/verify (\d+)/, (msg, match) => {
  if (msg.from.id !== ADMIN_ID) return;

  const userId = parseInt(match[1]);

  if (!userState[userId]) {
    userState[userId] = { task: 0, photos1: 0, photos2: 0, photos3: 0, earned: 0, verified: true };
  } else {
    userState[userId].verified = true;
  }

  bot.sendMessage(msg.chat.id, `✅ User ID ${userId} đã được xác nhận tài khoản.`);
  bot.sendMessage(userId, `🎉 Tài khoản của bạn đã được admin xác nhận. Bây giờ bạn có thể rút tiền.`);
  });
  
// ===== LỆNH NẠP TIỀN =====
bot.onText(/\/naptien (\d+) (\d+)/, (msg, match) => {
  if (msg.from.id !== ADMIN_ID) return; // chỉ admin mới nạp được

  const userId = parseInt(match[1]);
  const amount = parseInt(match[2]);

  if (!userState[userId]) {
    userState[userId] = { task: 0, photos1: 0, photos2: 0, photos3: 0, earned: 0 };
  }

  // Cộng tiền vào số dư
  userState[userId].earned = (userState[userId].earned || 0) + amount;

  // Thông báo cho user kèm số dư mới
  bot.sendMessage(
    userId,
    `💰 Bạn vừa nạp thành công ${amount.toLocaleString()} VND vào tài khoản.\n` +
    `💸 Tổng số dư hiện tại: ${userState[userId].earned.toLocaleString()} VND`
  );

  // Thông báo cho admin
  bot.sendMessage(msg.chat.id, `✅ Đã nạp ${amount.toLocaleString()} VND cho user ID: ${userId}`);
});

// ===== /start =====
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  if (bannedUsers.has(chatId)) {
    return bot.sendMessage(chatId, "❌ Bạn đã bị cấm sử dụng bot này.");
  }
  // Nếu user đang rút tiền
  if (state.withdrawStep) {

    // Bấm Cancel
    if (text === "Cancel") {
      state.withdrawStep = 0;
      state.withdrawAmount = 0;
      state.withdrawInfo = "";
      return bot.sendMessage(chatId, "❌ Bạn đã hủy thao tác rút tiền.", {
        reply_markup: {
          keyboard: [
            [{ text: "ℹ️ Thông tin cá nhân" }],
            [{ text: "📌 Nhiệm vụ 1" }],
            [{ text: "📌 Nhiệm vụ 2" }],
            [{ text: "📌 Nhiệm vụ 3" }],
            [{ text: "💰 Số dư" }, { text: "💸 Rút tiền" }]
          ],
          resize_keyboard: true
        }
      });
    }

    // Bước 1: nhập số tiền
    if (state.withdrawStep === 1) {
      const amount = parseInt(text.replace(/\D/g, ""));
      if (isNaN(amount) || amount < 200000) {
        return bot.sendMessage(chatId, "❌ Số tiền dưới 200,000 VND không thể rút.");
      }
      if (amount > state.earned) {
        return bot.sendMessage(chatId, `❌ Bạn không đủ số dư. Số dư hiện tại: ${state.earned.toLocaleString()} VND`);
      }

      state.withdrawAmount = amount;
      state.withdrawStep = 2;

      return bot.sendMessage(chatId,
        `Bạn muốn rút: ${amount.toLocaleString()} VND\n` +
        `Hãy nhập thông tin ngân hàng hoặc ví nhận tiền.\n` +
        `Ví dụ: Vietcombank 123456 N.V.A`
      );
    }

    // Bước 2: nhập thông tin ngân hàng
    if (state.withdrawStep === 2) {
      state.withdrawInfo = text;
      state.withdrawStep = 3;

      return bot.sendMessage(chatId,
        `Bạn có muốn rút số tiền ${state.withdrawAmount.toLocaleString()} VND không?\n` +
        `Thông tin nhận tiền: ${state.withdrawInfo}`,
        {
          reply_markup: {
            keyboard: [
              [{ text: "Xác nhận" }, { text: "Huỷ Rút" }]
            ],
            resize_keyboard: true
          }
        }
      );
    }

    // Bước 3: xác nhận hoặc hủy
    if (state.withdrawStep === 3) {
      if (text === "Huỷ Rút") {
        state.withdrawStep = 0;
        state.withdrawAmount = 0;
        state.withdrawInfo = "";
        return bot.sendMessage(chatId, "❌ Bạn đã hủy thao tác rút tiền.");
      }
      if (text === "Xác nhận") {
        // trừ tiền
        state.earned -= state.withdrawAmount;
        const withdrawAmount = state.withdrawAmount;
        const info = state.withdrawInfo;
        state.withdrawStep = 0;
        state.withdrawAmount = 0;
        state.withdrawInfo = "";

        // thông báo user
        bot.sendMessage(chatId, `✅ Bạn đã xác nhận rút số tiền ${withdrawAmount.toLocaleString()} VND\nChờ admin xử lý.`);

        // thông báo admin
        bot.sendMessage(ADMIN_ID,
          `💸 YÊU CẦU RÚT TIỀN\n\n` +
          `👤 User: ${msg.from.first_name || ""}\n` +
          `🆔 ID: ${chatId}\n` +
          `Số tiền: ${withdrawAmount.toLocaleString()} VND\n` +
          `Thông tin nhận tiền: ${info}`
        );
      }
      return;
    }
  }
  // Chỉ khởi tạo user mới
  if (!userState[chatId]) {
    userState[chatId] = {
      task: 0,
      photos1: 0,
      photos2: 0,
      photos3: 0,
      earned: 0,
      verified: false,
      withdrawStep: 0,   // 0 = không rút, 1 = nhập số tiền, 2 = nhập thông tin ngân hàng, 3 = xác nhận
      withdrawAmount: 0,
      withdrawInfo: ""
    };
  }

  bot.sendMessage(
    chatId,
    "🎉 *Chào Mừng CTV mới đến với BOT của Thuỳ Linh!* 🎉\n\n" +
      "Các bạn ấn vào các nhiệm vụ dưới đây để hoàn thành rồi gửi ảnh đã hoàn thành vào BOT luôn. Chúc các bạn làm việc thật thành công ❤️",
    {
      parse_mode: "Markdown",
      reply_markup: {
        keyboard: [
          [{ text: "ℹ️ Thông tin cá nhân" }],
          [{ text: "📌 Nhiệm vụ 1" }],
          [{ text: "📌 Nhiệm vụ 2" }],
          [{ text: "📌 Nhiệm vụ 3" }],
          [{ text: "💰 Số dư" }, { text: "💸 Rút tiền" }] // Đã bỏ "✅ Đã xong"
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

  // Khởi tạo state nếu chưa có
  if (!userState[chatId]) {
    userState[chatId] = {
      task: 0,
      photos1: 0,
      photos2: 0,
      photos3: 0,
      earned: 0,
      verified: false,
      withdrawStep: 0,
      withdrawAmount: 0,
      withdrawInfo: ""
    };
  }
  const state = userState[chatId];

  // KIỂM TRA BAN
  if (bannedUsers.has(chatId)) {
    return bot.sendMessage(chatId, "❌ Bạn đã bị cấm sử dụng bot này.");
  }

  // XỬ LÝ /start
  if (text === "/start") {
    return bot.sendMessage(
      chatId,
      "🎉 *Chào Mừng CTV mới đến với BOT của Thuỳ Linh!* 🎉\n\n" +
      "Các bạn ấn vào các nhiệm vụ dưới đây để hoàn thành rồi gửi ảnh đã hoàn thành vào BOT luôn. Chúc các bạn làm việc thật thành công ❤️",
      {
        parse_mode: "Markdown",
        reply_markup: {
          keyboard: [
            [{ text: "ℹ️ Thông tin cá nhân" }],
            [{ text: "📌 Nhiệm vụ 1" }],
            [{ text: "📌 Nhiệm vụ 2" }],
            [{ text: "📌 Nhiệm vụ 3" }],
            [{ text: "💰 Số dư" }, { text: "💸 Rút tiền" }]
          ],
          resize_keyboard: true
        }
      }
    );
  }

  // XEM THÔNG TIN CÁ NHÂN
  if (text === "ℹ️ Thông tin cá nhân") {
    const balance = (state.photos1 ? 20000 : 0) +
                    (state.photos2 || 0) * 5000 +
                    (state.photos3 || 0) * 5000;
    return bot.sendMessage(
      chatId,
      `👤 Tên: ${msg.from.first_name || ""}\n` +
      `🆔 ID: ${chatId}\n` +
      `💰 Số dư: ${balance.toLocaleString()} VND`
    );
  }

  // XEM SỐ DƯ
  if (text === "💰 Số dư") {
    const balance = (state.photos1 ? 20000 : 0) +
                    (state.photos2 || 0) * 5000 +
                    (state.photos3 || 0) * 5000;
    return bot.sendMessage(chatId, `💰 Số dư hiện tại của bạn: ${balance.toLocaleString()} VND`);
  }

  // RÚT TIỀN BẮT ĐẦU
  if (text === "💸 Rút tiền") {
    if (!state.verified) {
      return bot.sendMessage(chatId, "❌ Bạn chưa xác nhận tài khoản. Vui lòng liên hệ @thuylinhnei để xác nhận.");
    }
    if ((state.photos1 ? 20000 : 0) + (state.photos2 || 0)*5000 + (state.photos3 || 0)*5000 < 200000) {
      return bot.sendMessage(chatId, "❌ Số dư dưới 200,000 VND không thể rút tiền.");
    }

    state.withdrawStep = 1;
    return bot.sendMessage(chatId,
      `✅  Rút tiền 24/24\nSố Tiền Rút Tối Thiểu Là: 200,000 VND\n\n` +
      `Bạn nhập số tiền muốn rút ở dưới nha:`,
      { reply_markup: { keyboard: [[{ text: "Cancel" }]], resize_keyboard: true } }
    );
  }

  // XỬ LÝ RÚT TIỀN
  if (state.withdrawStep) {
    if (text === "Cancel") {
      state.withdrawStep = 0;
      state.withdrawAmount = 0;
      state.withdrawInfo = "";
      return bot.sendMessage(chatId, "❌ Bạn đã hủy thao tác rút tiền.", {
        reply_markup: { keyboard: [
          [{ text: "ℹ️ Thông tin cá nhân" }],
          [{ text: "📌 Nhiệm vụ 1" }],
          [{ text: "📌 Nhiệm vụ 2" }],
          [{ text: "📌 Nhiệm vụ 3" }],
          [{ text: "💰 Số dư" }, { text: "💸 Rút tiền" }]
        ], resize_keyboard: true }
      });
    }

    if (state.withdrawStep === 1) {
      const amount = parseInt(text.replace(/\D/g, ""));
      if (isNaN(amount) || amount < 200000) return bot.sendMessage(chatId, "❌ Số tiền dưới 200,000 VND không thể rút.");
      const balance = (state.photos1 ? 20000 : 0) + (state.photos2 || 0)*5000 + (state.photos3 || 0)*5000;
      if (amount > balance) return bot.sendMessage(chatId, `❌ Bạn không đủ số dư. Số dư hiện tại: ${balance.toLocaleString()} VND`);
      state.withdrawAmount = amount;
      state.withdrawStep = 2;
      return bot.sendMessage(chatId, `Bạn muốn rút: ${amount.toLocaleString()} VND\nHãy nhập thông tin ngân hàng hoặc ví nhận tiền.\nVí dụ: Vietcombank 123456 N.V.A`);
    }

    if (state.withdrawStep === 2) {
      state.withdrawInfo = text;
      state.withdrawStep = 3;
      return bot.sendMessage(chatId,
        `Bạn có muốn rút số tiền ${state.withdrawAmount.toLocaleString()} VND không?\nThông tin nhận tiền: ${state.withdrawInfo}`,
        { reply_markup: { keyboard: [[{ text: "Xác nhận" }, { text: "Huỷ Rút" }]], resize_keyboard: true } }
      );
    }

    if (state.withdrawStep === 3) {
      if (text === "Huỷ Rút") {
        state.withdrawStep = 0;
        state.withdrawAmount = 0;
        state.withdrawInfo = "";
        return bot.sendMessage(chatId, "❌ Bạn đã hủy thao tác rút tiền.");
      }
      if (text === "Xác nhận") {
        const withdrawAmount = state.withdrawAmount;
        const info = state.withdrawInfo;
        state.withdrawStep = 0;
        state.withdrawAmount = 0;
        state.withdrawInfo = "";
        const balanceBefore = (state.photos1 ? 20000 : 0) + (state.photos2 || 0)*5000 + (state.photos3 || 0)*5000;
        let remaining = balanceBefore - withdrawAmount;

        // trừ tiền từ photos
        let remainingAmount = remaining;
        if (remainingAmount < (state.photos3 || 0)*5000) {
          state.photos3 = Math.floor(remainingAmount / 5000);
          remainingAmount -= state.photos3*5000;
        }
        if (remainingAmount < (state.photos2 || 0)*5000) {
          state.photos2 = Math.floor(remainingAmount / 5000);
          remainingAmount -= state.photos2*5000;
        }
        if (remainingAmount < 20000) {
          state.photos1 = remainingAmount >= 20000 ? 1 : 0;
        }

        bot.sendMessage(chatId, `✅ Bạn đã xác nhận rút số tiền ${withdrawAmount.toLocaleString()} VND\nChờ admin xử lý.`);
        bot.sendMessage(ADMIN_ID, `💸 YÊU CẦU RÚT TIỀN\n👤 User: ${msg.from.first_name || ""}\n🆔 ID: ${chatId}\nSố tiền: ${withdrawAmount.toLocaleString()} VND\nThông tin nhận tiền: ${info}`);
      }
      return;
    }
  }

  // CHỌN NHIỆM VỤ
  if (tasks[text]) {
    const taskNum = text.includes("1") ? 1 : text.includes("2") ? 2 : 3;
    if (taskNum === 2 && state.photos1 < 1) return bot.sendMessage(chatId, "❌ Bạn chưa hoàn thành NV1.");
    if (taskNum === 3 && state.photos2 < 20) return bot.sendMessage(chatId, "❌ Bạn chưa hoàn thành NV2.");
    state.task = taskNum;

    const task = tasks[text];
    if (typeof task === "string") return bot.sendMessage(chatId, task, { parse_mode: "Markdown" });
    return bot.sendMessage(chatId, task.text, { parse_mode: "Markdown", reply_markup: { inline_keyboard: [[{ text: "Bấm vào đây", url: task.url }]] } });
  }

  // NHẬN ẢNH
  if (msg.photo) {
    // Nếu chưa chọn nhiệm vụ, tự nhận nhiệm vụ đang làm dở
    if (!state.task) {
      if ((state.photos1 || 0) < 1) state.task = 1;
      else if ((state.photos2 || 0) < 20) state.task = 2;
      else state.task = 3;
    }

    let earnedThisPhoto = 0;
    if (state.task === 1 && !state.photos1) {
      state.photos1 = 1;
      earnedThisPhoto = 20000;
    } else if (state.task === 2) {
      const photosSent = msg.photo.length;
      state.photos2 = (state.photos2 || 0) + photosSent;
      earnedThisPhoto = 5000 * photosSent;
    } else if (state.task === 3) {
      const photosSent = msg.photo.length;
      state.photos3 = (state.photos3 || 0) + photosSent;
      earnedThisPhoto = 5000 * photosSent;
    }

    // Thông báo admin
    await bot.sendMessage(ADMIN_ID, `📥 BÁO CÁO\n👤 ${msg.from.first_name}\n🆔 ${chatId}\nNV${state.task}\nẢnh NV1:${state.photos1 || 0}/1\nNV2:${state.photos2 || 0}/20\nNV3:${state.photos3 || 0}/20\n💰 Thu nhập:${earnedThisPhoto.toLocaleString()} VND`);
    await bot.forwardMessage(ADMIN_ID, chatId, msg.message_id);

    // Thông báo user
    const photos = state.task === 2 ? state.photos2 : state.photos3;
    const maxPhotos = state.task === 2 || state.task === 3 ? 20 : 1;
    if (photos < maxPhotos) {
      return bot.sendMessage(chatId, `📸 Đã nhận ${photos}/${maxPhotos} ảnh.\n+${earnedThisPhoto.toLocaleString()} VND. Số dư: ${(state.photos1?20000:0)+(state.photos2||0)*5000+(state.photos3||0)*5000} VND`);
    } else {
      return bot.sendMessage(chatId, `🎉 Hoàn thành NV${state.task}!\n+${earnedThisPhoto.toLocaleString()} VND. Số dư: ${(state.photos1?20000:0)+(state.photos2||0)*5000+(state.photos3||0)*5000} VND\nBạn có thể gửi thêm để tăng thu nhập.`);
    }
  }
});

console.log("BOT RUNNING OK");