// app/page.tsx
import { MessageForm } from '@/features/message-form/ui/MessageForm';
import styles from './Home.module.scss';
import { TelegramProvider } from '@/shared/providers/TelegramProvider';

export default function HomePage() {
    return (
        <TelegramProvider>
            <div className={styles.homePage}>
                <MessageForm />
            </div>
        </TelegramProvider>
    );
}
