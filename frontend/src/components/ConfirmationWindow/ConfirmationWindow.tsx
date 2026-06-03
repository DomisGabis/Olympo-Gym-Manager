import type { ReactNode } from 'react';
import Button from '../Button/Button';
import styles from './ConfirmationWindow.module.css'

interface Props {
    children: ReactNode;
    onConfirm: () => void;
    onClose: () => void;
}

function ConfirmationWindow({ children, onConfirm, onClose }: Props) {
    return (
        <div className={styles.container}>
            <div className={styles.message}>
                {children}
            </div>
            <div className={styles.buttonSection}>
                <Button onClick={onConfirm} style='primary'>
                    Potwierdź
                </Button>
                <Button onClick={onClose} style='secondary'>
                    Anuluj
                </Button>
            </div>
        </div>
    );
}

export default ConfirmationWindow