'use client'

import { useState } from "react";
import { TelegramProvider } from "@/shared/providers/TelegramProvider";
import styles from "./MessageForm.module.scss";
import { Button } from "@/shared/ui";

export function MessageForm() {
    const [text, setText] = useState("");

    const sendMessage = async () => {
        if (!text.trim()) return;

        try {
            await fetch("/entities/message/api/sendMessage.api", {
                method: "POST",
                body: JSON.stringify({ text }),
            });

            setText("");

            // безопасно закрываем Mini App
            const tg = window.Telegram?.WebApp;
            if (tg?.close) tg.close();
        } catch (err) {
            console.error("Ошибка при отправке:", err);
        }
    };

    return (
        <TelegramProvider>
            <div className={styles.messageForm}>
                <h1 className={styles.title}>Задайте вопрос</h1>

                <textarea
                    className={styles.textarea}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Введите сообщение..."
                    rows={4}
                />

                <Button className={styles.button} onClick={sendMessage}>
                    Отправить
                </Button>
            </div>
        </TelegramProvider>
    );
}
