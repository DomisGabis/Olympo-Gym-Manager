import { Link } from 'react-router-dom';
import styles from './HomePageCard.module.css';

interface Props {
    title?: string;
    children?: React.ReactNode;
    link?: string;
    onClick?: () => void;
}

function HomePageCard({ title, children, link, onClick }: Props) {
    return (
        <>
        {link ? (
            <Link to={link} className={styles.card + ' ' + styles.clickable}>
                <h2>{title}</h2>
                <div className={styles.content}>
                    {children}
                </div>
            </Link>
        ) : (
            <div className={onClick ? styles.clickable + ' ' + styles.card : styles.card} onClick={onClick}>
                <h2>{title}</h2>
                <div className={styles.content}>
                    {children}
                </div>
            </div>
        )}
        </>
    );
}

export default HomePageCard