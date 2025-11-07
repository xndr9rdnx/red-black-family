'use client';

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useTelegram } from "@/shared/providers/TelegramProvider";
import styles from "./MessageForm.module.scss";
import { Button } from "@/shared/ui";

export function MessageForm() {
    const [text, setText] = useState("");
    const [isSent, setIsSent] = useState(false);
    const { user } = useTelegram();

    // --- Drag-анимация контента ---
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const contentRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });
    };

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging) return;
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        },
        [isDragging, dragStart]
    );

    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            setPosition({ x: 0, y: 0 });
        }
    }, [isDragging]);

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        const touch = e.touches[0];
        setDragStart({
            x: touch.clientX - position.x,
            y: touch.clientY - position.y,
        });
    };

    const handleTouchMove = useCallback(
        (e: TouchEvent) => {
            if (!isDragging) return;
            e.preventDefault();
            const touch = e.touches[0];
            setPosition({
                x: touch.clientX - dragStart.x,
                y: touch.clientY - dragStart.y,
            });
        },
        [isDragging, dragStart]
    );

    const handleTouchEnd = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            setPosition({ x: 0, y: 0 });
        }
    }, [isDragging]);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            document.addEventListener("touchmove", handleTouchMove, { passive: false });
            document.addEventListener("touchend", handleTouchEnd);

            return () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
                document.removeEventListener("touchmove", handleTouchMove);
                document.removeEventListener("touchend", handleTouchEnd);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

    // --- Отправка сообщения ---
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

    // --- Отображение статуса ---
    if (isSent) {
        return (
            <div className={styles.fullscreenMessage}>
                <div className={styles.messageBox}>
                    <h1>✅ Ваш вопрос отправлен!</h1>
                    <Button onClick={closeMessage} className={styles.closeButton}>
                        Закрыть
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.messageForm}>
            <div
                className={styles.content}
                ref={contentRef}
                style={{
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    transition: isDragging
                        ? 'none'
                        : 'transform 1s cubic-bezier(0.25, 0.1, 0.25, 1)',
                    cursor: isDragging ? 'grabbing' : 'grab',
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                <div className={styles.glassFilter}></div>
                <div className={styles.glassOverlay}></div>
                <div className={styles.glassSpecular}></div>

                {/* Заголовок */}
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

            <svg className={styles.svg}>
                <filter id="lg-dist" x="0%" y="0%" width="100%" height="100%">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.008 0.008"
                        numOctaves="2"
                        seed="92"
                        result="noise"
                    />
                    <feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="blurred"
                        scale="70"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>
            </svg>
        </div>
    );
}
