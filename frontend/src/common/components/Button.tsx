import { Link } from 'react-router-dom';
import styles from './Button.module.css';

interface Props {
    style?: 'primary' | 'secondary' | 'navbar';
    type?: 'button' | 'submit' | 'reset';
    children?: React.ReactNode;
    onClick?: () => void;
    to?: string;
}
    
function Button({ type, children, onClick, style, to }: Props) {
    return (
        to ? (
            <Link to={to}>
                <button type={type} onClick={onClick} className={style ? styles[style] : 'primary'}>
                    {children}
                </button>
            </Link>
        ) : (
            <button type={type} onClick={onClick} className={style ? styles[style] : 'primary'}>
                {children}
            </button>
        )
    )
}
export default Button