// src/shared/providers/TelegramProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface TelegramUser {
    id?: number;
    first_name?: string;
    last_name?: string;
    username?: string;
}

// Контекст
interface TelegramContextValue {
    user: TelegramUser;
}
const TelegramContext = createContext<TelegramContextValue>({ user: {} });
export const useTelegram = () => useContext(TelegramContext);

interface TelegramProviderProps {
    children: ReactNode;
}

// Расширенный тип WebApp для доступа к initDataUnsafe
interface ExtendedWebApp {
    initDataUnsafe?: { user?: TelegramUser };
    ready: () => void;
}

// Расширяем window для провайдера
declare global {
    interface Window {
        Telegram?: {
            WebApp?: ExtendedWebApp;
        };
    }
}

export function TelegramProvider({ children }: TelegramProviderProps) {
    const [user, setUser] = useState<TelegramUser>({});

    useEffect(() => {
        console.log('[TGProvider] init effect start');

        const tg = window.Telegram?.WebApp;
        if (!tg) {
            console.warn('[TGProvider] Telegram.WebApp not found. Возможно, открыто вне Telegram.');
            return;
        }

        // Вызываем ready чуть позже — Telegram Desktop иногда не успевает подготовить initData
        console.log('[TGProvider] Telegram.WebApp найден, вызываем ready() через 100мс...');
        setTimeout(() => {
            tg.ready();
            console.log('[TGProvider] tg.ready() вызван');
        }, 100);

        const tryGetUser = () => {
            const userData = tg.initDataUnsafe?.user;
            if (userData && Object.keys(userData).length > 0) {
                console.log('[TGProvider] user найден:', userData);
                setUser(userData);
                return true;
            }
            console.log('[TGProvider] user ещё не доступен:', tg.initDataUnsafe);
            return false;
        };

        // Пробуем сразу
        if (!tryGetUser()) {
            console.log('[TGProvider] user не найден сразу, ждём появления...');
            // Telegram Desktop часто подгружает user с задержкой
            const interval = setInterval(() => {
                console.log('[TGProvider] повторная попытка получить user...');
                if (tryGetUser()) {
                    console.log('[TGProvider] user успешно получен!');
                    clearInterval(interval);
                }
            }, 150);

            // Ограничим ожидание до 2 секунд
            setTimeout(() => {
                console.warn('[TGProvider] истекло время ожидания user (2с), прекращаем попытки');
                clearInterval(interval);
            }, 2000);
        }
    }, []);

    return (
        <TelegramContext.Provider value={{ user }}>
            {children}
        </TelegramContext.Provider>
    );
}
