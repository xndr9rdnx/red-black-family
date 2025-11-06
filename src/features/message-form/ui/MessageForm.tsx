'use client'

import { useState } from "react";
import { TelegramProvider } from "@/shared/providers/TelegramProvider";
import styles from "./MessageForm.module.scss";

export function MessageForm() {
    const [text, setText] = useState("");

    const sendMessage = async () => {
        if (!text.trim()) return alert("Введите сообщение");

        try {
            const res = await fetch("/entities/message/api/sendMessage.api", {
                method: "POST",
                body: JSON.stringify({ text }),
            });

            if (!res.ok) throw new Error("Failed");

            alert("Сообщение отправлено!");
            setText("");

            // безопасно закрываем Mini App, проверяя существование WebApp
            const tg = window.Telegram?.WebApp;
            if (tg && typeof tg.close === "function") {
                tg.close();
            }
        } catch {
            alert("Ошибка при отправке");
        }
    };

    return (
        <TelegramProvider>
            <main className={styles.main}>
                <h1 className={styles.title}>Задайте вопрос</h1>
                <textarea
                    className={styles.textarea}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Введите сообщение..."
                    rows={4}
                />
                <button className={styles.button} onClick={sendMessage}>
                    Отправить
                </button>
            </main>
        </TelegramProvider>
    );
}
