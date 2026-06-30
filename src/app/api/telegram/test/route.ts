import { NextResponse } from "next/server";

type TelegramTestPayload = {
  bot_token?: string;
  chat_id?: string;
  message?: string;
};

export async function POST(request: Request) {
  const body = await request.json() as TelegramTestPayload;
  const botToken = body.bot_token?.trim();
  const chatId = body.chat_id?.trim();
  const message = body.message?.trim() || "SubGroup Manager test message ✅";

  // Private prototype only. In production, decrypt the Telegram token server-side
  // or load it from protected Supabase/server configuration, never from public client state.
  if (!botToken || !chatId) {
    return NextResponse.json({ ok: false, error: "Missing bot token or chat id." }, { status: 400 });
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message
    })
  });

  const result = await response.json();
  if (!response.ok) {
    return NextResponse.json({ ok: false, error: result.description ?? "Telegram request failed." }, { status: response.status });
  }

  return NextResponse.json({ ok: true, result });
}

