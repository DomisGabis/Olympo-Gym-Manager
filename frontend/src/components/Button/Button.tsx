import { Link } from 'react-router-dom';
import styles from './Button.module.css';

interface Props {
    style?: 'primary' | 'secondary' | 'navbar';
    type?: 'button' | 'submit' | 'reset';
    children?: React.ReactNode;
    onClick?: () => void;
    link?: string;
    disabled?: boolean;
}
    
function Button({ type, children, onClick, style, link: to, disabled }: Props) {
    return (
        to ? (
            <Link to={to}>
                <button type={type} onClick={onClick} className={style ? styles[style] : 'primary'} disabled={disabled}>
                    <span className={styles.buttonContent}>
                        {children}
                    </span>
                </button>
            </Link>
        ) : (
            <button type={type} onClick={onClick} className={style ? styles[style] : 'primary'} disabled={disabled}>
                <span className={styles.buttonContent}>
                    {children}
                </span>
            </button>
        )
    )
}
export default Button