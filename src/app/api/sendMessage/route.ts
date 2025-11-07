// src/app/api/sendMessage/route.ts
import { NextRequest, NextResponse } from "next/server";

interface TelegramUser {
    id?: number;
    username?: string;
    first_name?: string;
    last_name?: string;
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

    // Проверяем, пришли ли вообще данные о пользователе
    const isAuthorized = !!(user && Object.keys(user).length > 0);

    // Формируем текст с описанием каждого поля
    const userInfo = isAuthorized
        ? [
            `ID пользователя: ${user.id ?? "нет ID"}`,
            `Имя: ${user.first_name ?? "нет имени"}`,
            `Фамилия: ${user.last_name ?? "нет фамилии"}`,
            `Username: ${user.username ? `@${user.username}` : "нет username"}`,
        ].join("\n")
        : "❌ Пользователь не авторизован в Telegram WebApp (initData отсутствует)";

    // Итоговый текст сообщения
    const messageText = [
        `#${messageId}`,
        `👤 Информация о пользователе:`,
        userInfo,
        "",
        `💬 Сообщение:`,
        text,
    ].join("\n");

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
