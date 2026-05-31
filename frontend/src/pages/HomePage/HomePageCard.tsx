import { Link } from 'react-router-dom';
import styles from './HomePageCard.module.css';

interface Props {
    title?: string;
    children?: React.ReactNode;
    link?: string;
}

function HomePageCard({ title, children, link }: Props) {
    return (
        <>
        {link ? (
            <Link to={link} className={styles.card + ' ' + styles.clickable}>
                <h2>{title}</h2>
                {children}
            </Link>
        ) : (
            <div className={styles.card}>
                <h2>{title}</h2>
                {children}
            </div>
        )}
        </>
    );
}

export default HomePageCard