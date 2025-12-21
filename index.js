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

// ===== LỆNH BAN / UNBAN =====
bot.onText(/\/ban (\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userIdToBan = parseInt(match[1]);

  if (chatId !== ADMIN_ID) return; // chỉ admin mới được ban

  bannedUsers.add(userIdToBan);
  bot.sendMessage(chatId, `✅ Đã cấm user ID: ${userIdToBan}`);
});

bot.onText(/\/unban (\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userIdToUnban = parseInt(match[1]);

  if (chatId !== ADMIN_ID) return; // chỉ admin mới được unban

  bannedUsers.delete(userIdToUnban);
  bot.sendMessage(chatId, `✅ Đã bỏ cấm user ID: ${userIdToUnban}`);
});

// ===== LƯU TRẠNG THÁI USER =====
const userState = {};
// userState[userId] = { task: 0|1|2|3, photos: number }

// ===== /start =====
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  if (bannedUsers.has(chatId)) {
    return bot.sendMessage(chatId, "❌ Bạn đã bị cấm sử dụng bot này.");
  }

  userState[chatId] = { task: 0, photos: 0 };

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
          [{ text: "✅ Đã xong" }]
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

Sau khi hoàn thành xong chụp đủ ít nhất 20 ảnh để tiếp tục`,
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

Sau khi hoàn thành xong chụp đủ ít nhất 20 ảnh để tiếp tục`,
    url: "https://t.me/thuylinhnei1/42"
  }
};

// ===== MESSAGE =====
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const user = msg.from;

  // ===== KIỂM TRA BAN =====
  if (bannedUsers.has(chatId)) {
    return bot.sendMessage(chatId, "❌ Bạn đã bị cấm sử dụng bot này.");
  }

  if (!userState[chatId]) {
    userState[chatId] = { task: 0, photos: 0 };
  }

  const state = userState[chatId];

  // ===== NÚT "ĐÃ XONG" =====
  if (text === "✅ Đã xong") {
    if (state.task < 3 || state.photos < 20) {
      return bot.sendMessage(
        chatId,
        "❌ Bạn chưa hoàn thành đủ Nhiệm vụ 3 (20 ảnh). Vui lòng hoàn thành trước khi nhấn 'Đã xong'."
      );
    }
    return bot.sendMessage(
      chatId,
      "🎉 Chúc mừng bạn đã hoàn thành đủ 3 nhiệm vụ!\n" +
      "👉 Giờ hãy nhắn cho Thuỳ Linh để báo cáo đã hoàn thành xong công việc"
    );
  }

  // ===== CHỌN NHIỆM VỤ =====
  if (tasks[text]) {
    const taskNum = text.includes("1") ? 1 : text.includes("2") ? 2 : 3;

    // Kiểm tra điều kiện NV2 -> NV3
    if (taskNum === 3 && (state.task < 2 || state.photos < 20)) {
      return bot.sendMessage(
        chatId,
        "❌ Bạn chưa hoàn thành đủ 20 ảnh của Nhiệm vụ 2. Vui lòng hoàn thành trước khi qua NV3."
      );
    }

    // Cập nhật state
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

  // ===== NHẬN ẢNH =====
  if (msg.photo) {
    if (!state.task) return;

    state.photos++;

    await bot.sendMessage(
      ADMIN_ID,
      `📥 BÁO CÁO HOÀN THÀNH\n\n` +
      `👤 User: ${user.first_name || ""}\n` +
      `🆔 ID: ${chatId}\n` +
      `📌 Nhiệm vụ: Nhiệm vụ ${state.task}\n` +
      `📷 Ảnh: ${state.photos} / 20`
    );

    await bot.forwardMessage(ADMIN_ID, chatId, msg.message_id);

    // ===== THÔNG BÁO NGƯỜI GỬI =====
    if (state.photos < 20) {
      await bot.sendMessage(
        chatId,
        `📸 Đã nhận ${state.photos}/20 ảnh. Vui lòng gửi tiếp.`
      );
    } else {
      await bot.sendMessage(
        chatId,
        "🎉 Chúc mừng bạn đã hoàn thành nhiệm vụ nếu bạn vẫn muốn làm thêm gửi thêm ảnh để thêm thu nhập thì cứ tiếp tục tôi sẽ thanh toán đủ cho bạn."
      );
    }

    return;
  }

  // ===== CHẶN TEXT KHÁC =====
  return bot.sendMessage(
    chatId,
    "❌ Không thể gửi tin nhắn ở đây.\n👉 Hãy gửi ảnh hoàn thành nhiệm vụ ở đây. Có gì không hiểu vui lòng liên hệ @thuylinhnei để được giải đáp."
  );
});

console.log("BOT RUNNING OK");