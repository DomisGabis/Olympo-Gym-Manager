import { useAuth } from '../../context/AuthContext';
import logo from "/olympo-logo.png";
import styles from './HomePage.module.css';
import QrCodeCard from './QrCodeCard';
import EntriesCard from './EntriesCard';
import MembershipCard from './MembershipCard';
function HomePage() {
    const { user } = useAuth();

    const notSignedInRender = (
        <div className={styles.container}>
            <h1>Witaj w Olympo!</h1>
            <img src={logo} className={styles.logo} />
        </div>
    );

    const signedInRender = (
        <div className={styles.container}>
            <h1>Witaj w Olympo, {user?.firstName}!</h1>
            <img src={logo} className={styles.logo} />
            <div className={styles.cardsContainer}>
                <QrCodeCard />
                <EntriesCard />
                <MembershipCard />
            </div>
        </div>
    );

    return (
        <div className={styles.container}>
            {user ? signedInRender : notSignedInRender}
        </div>
    );
}

export default HomePage