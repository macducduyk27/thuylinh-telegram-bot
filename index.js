const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

const token = process.env.BOT_TOKEN;
const app = express();

if (!token) {
  console.error("BOT_TOKEN is missing");
  process.exit(1);
}

// ===== WEBHOOK (Render) =====
const WEBHOOK_URL = process.env.RENDER_EXTERNAL_URL;
const bot = new TelegramBot(token);
bot.setWebHook(`${WEBHOOK_URL}/bot${token}`);

app.use(express.json());

app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.get("/", (req, res) => {
  res.send("BOT THUỲ LINH IS RUNNING");
});

// ===== /start =====
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

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

// ===== NỘI DUNG NHIỆM VỤ =====
const tasks = {
  "📌 Nhiệm vụ 1": `🔥 *NV1: Tham Gia Các Hội Nhóm*
💰 *CÔNG: 20K*

🤖 BOT 1: [Nhấn vào đây](https://t.me/Kiemtien8989_bot?start=r03486044000)

📌 *Cách làm:*
- Tham gia tất cả kênh / nhóm
- Join hoặc Mute
- Quay lại bot

➡️ Hoàn thành xong ấn sang *Nhiệm vụ 2*`,

  "📌 Nhiệm vụ 2": {
    text: `🔥 *NV2: CÔNG VIỆC TRÊN THREAD*

📌 *Cách làm:*
- Lên Thread
- Bình luận + gửi hình ảnh
- Chụp màn hình lúc đã CMT

💰 *Thu nhập:*
- 1 CMT = 5K
- Đủ 20 CMT rút lương
- ❌ Không giới hạn
- CMT càng nhiều → thu nhập càng cao

👇 *Bấm nút bên dưới để xem hướng dẫn và lấy ảnh*`,
    button: {
      text: "Bấm vào đây",
      url: "https://t.me/thuylinhnei1/38"
    }
  },

  "📌 Nhiệm vụ 3": {
    text: `🔥 *NV3: CÔNG VIỆC TRÊN TIKTOK*

📌 *Cách làm:*
- Search (Tuyển dụng, MMO, Kiếm tiền online)
- REP CMT người tìm việc (mới nhất)
- Chụp màn hình

💰 *Thu nhập:*
- 1 CMT = 5K
- Đủ 20 CMT rút lương
- ❌ Không giới hạn
- CMT càng nhiều → thu nhập càng cao

👇 *Bấm nút bên dưới để xem hướng dẫn và lấy ảnh*`,
    button: {
      text: "Bấm vào đây",
      url: "https://t.me/thuylinhnei1/42"
    }
  }
};

// ===== XỬ LÝ TIN NHẮN =====
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return;
  if (text === "/start") return;

  // NÚT ĐÃ XONG
  if (text === "✅ Đã xong") {
    await bot.sendMessage(
      chatId,
      "🎉 *CHÚC MỪNG BẠN ĐÃ HOÀN THÀNH ĐỦ 3 NHIỆM VỤ!* 🎉\n\n" +
        "👇👇👇\n" +
        "[Ấn vào đây để nhắn Thuỳ Linh và gửi sản phẩm](https://t.me/thuylinhnei)",
      { parse_mode: "Markdown" }
    );
    return;
  }

  // NHIỆM VỤ
  if (tasks[text]) {
    const task = tasks[text];
    if (typeof task === "string") {
      await bot.sendMessage(chatId, task, { parse_mode: "Markdown" });
    } else {
      await bot.sendMessage(chatId, task.text, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: task.button.text, url: task.button.url }]
          ]
        }
      });
    }
  }
});

// ===== SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Bot running on port", PORT);
});