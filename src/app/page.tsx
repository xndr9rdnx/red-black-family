// app/page.tsx
import { MessageForm } from '@/features/message-form/ui/MessageForm';
import styles from './Home.module.scss';

export default function HomePage() {
    return (
        <div className={styles.homePage}>
            <MessageForm />;
        </div>
    );
}
