const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export function isTelegramConfigured() {
  return !!(BOT_TOKEN && CHAT_ID);
}

export function getTelegramChatId() {
  return CHAT_ID;
}

export async function sendTelegramNotification(
  text: string,
  replyMarkup?: object
) {
  if (!BOT_TOKEN || !CHAT_ID) return;

  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
      }),
    });

    if (!res.ok) {
      console.error(
        "Telegram notification failed:",
        res.status,
        await res.text()
      );
    }
  } catch (error) {
    console.error("Telegram notification error:", error);
  }
}

export async function answerTelegramCallback(
  callbackQueryId: string,
  text?: string
) {
  if (!BOT_TOKEN) return;
  try {
    await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        ...(text ? { text } : {}),
      }),
    });
  } catch (error) {
    console.error("Telegram callback answer error:", error);
  }
}

export async function editTelegramMessage(
  chatId: number | string,
  messageId: number,
  text: string,
  replyMarkup?: object
) {
  if (!BOT_TOKEN) return;
  try {
    const res = await fetch(`${TELEGRAM_API}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: "HTML",
        ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
      }),
    });

    if (!res.ok) {
      console.error(
        "Telegram edit message failed:",
        res.status,
        await res.text()
      );
    }
  } catch (error) {
    console.error("Telegram edit message error:", error);
  }
}