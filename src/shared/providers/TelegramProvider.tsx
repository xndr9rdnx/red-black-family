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
        const startTime = Date.now();
        const elapsed = () => `${Date.now() - startTime}ms`;

        console.log(`[TGProvider ${elapsed()}] init effect start`);

        // Проверяем Telegram.WebApp каждые 200 мс
        const waitForTelegram = setInterval(() => {
            if (window.Telegram?.WebApp) {
                clearInterval(waitForTelegram);
                console.log(`[TGProvider ${elapsed()}] Telegram.WebApp появился`);
                initTelegram(window.Telegram.WebApp);
            } else {
                console.log(`[TGProvider ${elapsed()}] Telegram.WebApp ещё не готов`);
            }
        }, 200);

        // Безопасно останавливаем через 5 секунд
        setTimeout(() => {
            clearInterval(waitForTelegram);
            if (!window.Telegram?.WebApp) {
                console.warn(`[TGProvider ${elapsed()}] Telegram.WebApp не появился за 5 сек`);
            }
        }, 5000);

        // Функция инициализации
        function initTelegram(tg: ExtendedWebApp) {
            console.log(`[TGProvider ${elapsed()}] Инициализация WebApp...`);

            setTimeout(() => {
                tg.ready();
                console.log(`[TGProvider ${elapsed()}] tg.ready() вызван`);
            }, 100);

            const tryGetUser = () => {
                const userData = tg.initDataUnsafe?.user;
                if (userData && Object.keys(userData).length > 0) {
                    console.log(`[TGProvider ${elapsed()}] user найден:`, userData);
                    setUser(userData);
                    return true;
                }
                console.log(`[TGProvider ${elapsed()}] user ещё не доступен:`, tg.initDataUnsafe);
                return false;
            };

            if (!tryGetUser()) {
                const interval = setInterval(() => {
                    if (tryGetUser()) {
                        clearInterval(interval);
                        console.log(`[TGProvider ${elapsed()}] user успешно получен`);
                    }
                }, 150);

                setTimeout(() => clearInterval(interval), 3000);
            }
        }
    }, []);


    return (
        <TelegramContext.Provider value={{ user }}>
            {children}
        </TelegramContext.Provider>
    );
}
