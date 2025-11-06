// import type { NextRequest } from "next/server";

// export const POST = async (req: NextRequest) => {
//     const { text } = await req.json();

//     if (!text?.trim()) {
//         return new Response(JSON.stringify({ error: "Empty message" }), { status: 400 });
//     }

//     const token = process.env.TELEGRAM_BOT_TOKEN;
//     const chatId = process.env.TELEGRAM_CHAT_ID;

//     try {
//         await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ chat_id: chatId, text }),
//         });

//         return new Response(JSON.stringify({ ok: true }), { status: 200 });
//     } catch (err) {
//         console.error(err);
//         return new Response(JSON.stringify({ error: "Failed to send" }), { status: 500 });
//     }
// };
