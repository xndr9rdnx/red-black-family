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
        const tg = window.Telegram?.WebApp;
        if (tg) {
            tg.ready();
            setUser(tg.initDataUnsafe?.user ?? {});
        }
    }, []);

    return (
        <TelegramContext.Provider value={{ user }}>
            {children}
        </TelegramContext.Provider>
    );
}
