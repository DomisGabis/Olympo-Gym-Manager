import type { ReactNode } from 'react';
import styles from './Modal.module.css'

interface Props {
    onClose: () => void;
    children: ReactNode;
}

function Modal({ onClose, children }: Props) {
    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.content} onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    )
}

export default Modal