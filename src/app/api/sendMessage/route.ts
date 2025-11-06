// src/app/api/sendMessage/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { text } = await req.json();

    if (!text?.trim()) {
        return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

    const token = '7900512023:AAFBSzEOq0l-K63XTEXUVP0UUDewJCT0iZQ';
    const chatId = '-1003289488234';

    try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text }),
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to send" }, { status: 500 });
    }
}
