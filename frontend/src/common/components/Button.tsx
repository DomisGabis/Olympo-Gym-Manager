import styles from './Button.module.css';

interface Props {
    style?: 'primary' | 'secondary' | 'navbar';
    type?: 'button' | 'submit' | 'reset';
    children: React.ReactNode;
    onClick: () => void;
}

function Button({ type, children, onClick, style }: Props) {
    return (
        <button type={type} onClick={onClick} className={style ? styles[style] : undefined}>
            {children}
        </button>
    )
}
export default Button