'use client';

import { useState } from "react";
import { useTelegram } from "@/shared/providers/TelegramProvider";
import styles from "./MessageForm.module.scss";

export function MessageForm() {
    const [text, setText] = useState("");
    const [isSent, setIsSent] = useState(false);
    const { user } = useTelegram();

    const sendMessage = async () => {
        if (!text.trim()) return;

        try {
            await fetch("/api/sendMessage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, user }),
            });

            setIsSent(true);
            setText("");
        } catch (err) {
            console.error("Ошибка при отправке:", err);
        }
    };

    const closeMessage = () => setIsSent(false);

    if (isSent) {
        return (
            <div className={styles.fullscreenMessage}>
                <div className={styles.messageBox}>
                    <h1>✅ Ваш вопрос отправлен!</h1>
                    <button onClick={closeMessage} className={styles.closeButton}>
                        Закрыть
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.messageForm}>
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
        </div>
    );
}
