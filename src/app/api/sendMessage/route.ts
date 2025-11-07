// src/app/api/sendMessage/route.ts
import { NextRequest, NextResponse } from "next/server";

interface TelegramUser {
    username?: string;
    first_name?: string;
}

export async function POST(req: NextRequest) {
    const { text, user }: { text: string; user?: TelegramUser } = await req.json();

    if (!text?.trim()) {
        return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Формируем уникальный ID сообщения
    const messageId = Date.now();

    // Формируем текст с юзернеймом и номером
    const messageText = `#${messageId}\nПользователь: ${user?.username || user?.first_name || 'Anonymous'}\nВопрос: ${text}`;

    try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: messageText }),
        });

        return NextResponse.json({ ok: true, messageId });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to send" }, { status: 500 });
    }
}
