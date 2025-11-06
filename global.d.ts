// global.d.ts
interface TelegramWebApp {
    ready: () => void;
    close?: () => void;
    // можно добавить другие методы WebApp
}

interface Window {
    Telegram?: {
        WebApp: TelegramWebApp;
    };
}

declare module '*.scss';
declare module '*.css';
