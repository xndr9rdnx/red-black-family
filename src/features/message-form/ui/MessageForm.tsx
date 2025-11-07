'use client';

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useTelegram } from "@/shared/providers/TelegramProvider";
import styles from "./MessageForm.module.scss";
import { Button } from "@/shared/ui";

export function MessageForm() {
    const [text, setText] = useState("");
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState("");
    const { user } = useTelegram();

    // Drag logic
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const contentRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Загружаем текст из localStorage при монтировании
    useEffect(() => {
        const saved = localStorage.getItem("messageText");
        if (saved) setText(saved);
    }, []);

    const startDrag = (x: number, y: number) => {
        setIsDragging(true);
        setDragStart({ x: x - position.x, y: y - position.y });
    };

    const moveDrag = (x: number, y: number) => {
        if (!isDragging) return;
        setPosition({ x: x - dragStart.x, y: y - dragStart.y });
    };

    const endDrag = () => {
        if (isDragging) {
            setIsDragging(false);
            setPosition({ x: 0, y: 0 });
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        // запрещаем перетаскивать, если кликнули на textarea или button
        if (target.tagName === "TEXTAREA" || target.tagName === "BUTTON") return;
        startDrag(e.clientX, e.clientY);
    };
    const handleMouseMove = useCallback((e: MouseEvent) => moveDrag(e.clientX, e.clientY), [isDragging, dragStart]);
    const handleMouseUp = useCallback(() => endDrag(), [isDragging]);

    const handleTouchStart = (e: React.TouchEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === "TEXTAREA" || target.tagName === "BUTTON") return;
        const touch = e.touches[0];
        startDrag(touch.clientX, touch.clientY);
    };
    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        const touch = e.touches[0];
        moveDrag(touch.clientX, touch.clientY);
    }, [isDragging, dragStart]);
    const handleTouchEnd = useCallback(() => endDrag(), [isDragging]);

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

    const sendMessage = async () => {
        if (!text.trim()) {
            setError("Поле не должно быть пустым");
            return;
        }

        try {
            await fetch("/api/sendMessage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, user }),
            });
            setIsSent(true);
            setText("");
            setError("");
        } catch {
            setError("Ошибка при отправке сообщения");
        }
    };

    return (
        <div className={styles.messageForm}>
            <div
                className={styles.content}
                ref={contentRef}
                style={{
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    transition: isDragging ? "none" : "transform 1s cubic-bezier(0.25, 0.1, 0.25, 1)",
                    cursor: isDragging ? "grabbing" : "grab",
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                <div className={styles.glassFilter}></div>
                <div className={styles.glassOverlay}></div>
                <div className={styles.glassSpecular}></div>

                {isSent ? (
                    <>
                        <h1 className={styles.title}>Ваш вопрос отправлен!</h1>
                        <Button onClick={() => setIsSent(false)} className={styles.closeButton}>Закрыть</Button>
                    </>
                ) : (
                    <>
                        <h1 className={styles.title}>Задайте вопрос</h1>
                        <textarea
                            className={styles.textarea}
                            value={text}
                            ref={textareaRef}
                            onChange={(e) => {
                                const value = e.target.value;
                                setText(value);

                                // сохраняем в localStorage
                                localStorage.setItem("messageText", value);

                                const ta = textareaRef.current;
                                if (ta) {
                                    ta.style.height = 'auto';                // сброс текущей высоты
                                    ta.style.height = ta.scrollHeight + 'px'; // растягиваем по содержимому
                                }
                            }}
                            placeholder="Введите сообщение..."
                        />
                        {error && <p className={styles.error}>{error}</p>}
                        <Button className={styles.button} onClick={sendMessage}>Отправить</Button>
                    </>
                )}
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
