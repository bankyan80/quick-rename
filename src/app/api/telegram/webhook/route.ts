import { NextResponse } from "next/server";
import {
  answerTelegramCallback,
  editTelegramMessage,
  getTelegramChatId,
} from "@/lib/telegram";
import { getSession } from "@/lib/quota";
import { processOrderAction } from "@/lib/payment-admin";

const SECRET_TOKEN = process.env.TELEGRAM_SECRET_TOKEN || "";

export async function POST(request: Request) {
  try {
    if (
      !SECRET_TOKEN ||
      request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== SECRET_TOKEN
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const update = await request.json();
    const callback = update?.callback_query;

    if (!callback || typeof callback.data !== "string") {
      return NextResponse.json({ ok: true });
    }

    const [action, orderId] = callback.data.split(":");

    if (!["approve", "reject"].includes(action) || !orderId) {
      await answerTelegramCallback(callback.id, "Perintah tidak dikenal");
      return NextResponse.json({ ok: true });
    }

    const adminChatId = getTelegramChatId();
    if (adminChatId && String(callback.from?.id) !== String(adminChatId)) {
      await answerTelegramCallback(callback.id, "Anda bukan admin");
      return NextResponse.json({ ok: true });
    }

    const chatId = callback.message?.chat?.id;
    const messageId = callback.message?.message_id;

    try {
      const result = await processOrderAction(orderId, action, "telegram");

      await answerTelegramCallback(
        callback.id,
        action === "approve"
          ? `Disetujui: +${result.balanceAdded} file token`
          : "Pesanan ditolak"
      );

      if (chatId && messageId) {
        const header =
          action === "approve"
            ? `<b>\u{1F4CB} Pesanan ${result.orderNumber}</b>\n\u2705 Disetujui dari Telegram (+${result.balanceAdded} file token). Tokens telah dikredit ke akun pelanggan.`
            : `<b>\u{1F4CB} Pesanan ${result.orderNumber}</b>\n\u274C Ditolak dari Telegram.`;

        await editTelegramMessage(chatId, messageId, header, {
          inline_keyboard: [],
        });
      }
    } catch (error) {
      await answerTelegramCallback(
        callback.id,
        error instanceof Error ? error.message : "Gagal memproses pesanan"
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ error: "Failed to process update" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const webhookUrl = `${process.env.NEXTAUTH_URL || ""}/api/telegram/webhook`;
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return NextResponse.json(
      { error: "TELEGRAM_BOT_TOKEN not configured" },
      { status: 500 }
    );
  }

  const res = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getWebhookInfo`,
    { method: "GET" }
  );
  const info = await res.json();

  return NextResponse.json({ webhookUrl, info });
}