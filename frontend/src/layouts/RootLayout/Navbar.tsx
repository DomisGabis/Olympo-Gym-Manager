import { Link, useNavigate } from "react-router-dom";
import logo from "/olympo-logo.png";
import styles from './Navbar.module.css';
import { useAuth, type UserRole } from "../../context/AuthContext";
import Button from "../../components/Button/Button";

interface Props {
    role: UserRole;
}

function Navbar({ role }: Props) {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate('/login');
    }

    return (
        <nav>
            <div className={styles.leftSection}>
                <Link className={styles.homeLink} to="/">
                    <img className={styles.logo} src={logo} alt="Olympo Logo" />
                    <h1 className={styles.logoText}>Olympo</h1>
                </Link>
                {role === 'CLIENT' && (
                    <Button style="navbar" link="/training-plans">
                        Plan treningowy
                    </Button>
                )}
                {role === 'CLIENT' && (
                    <Button style="navbar" link="/trainers">
                        Trenerzy
                    </Button>
                )}
                {/* {role === 'CLIENT' && (
                    <Button style="navbar" link="/statistics">
                        Statystyki
                    </Button>
                )}
                {role === 'CLIENT' && (
                    <Button style="navbar" link="/notifications">
                        Powiadomienia
                    </Button>
                )} */}
                {(role === 'TRAINER') && (
                    <Button style="navbar" link="/calendar">
                        Kalendarz
                    </Button>
                )}
                {(role === 'TRAINER') && (
                    <Button style="navbar" link="/trainer-dashboard">
                        Podopieczni
                    </Button>
                )}
                {(role === 'TRAINER' || role === 'ADMIN') && (
                    <Button style="navbar" link="/exercises">
                        Ćwiczenia
                    </Button>
                )}
                {role === 'RECEPTIONIST' && (
                    <Button style="navbar" link="/receptionist-qr">
                        Kody QR
                    </Button>
                )}
                {role === 'RECEPTIONIST' && (
                    <Button style="navbar" link="/memberships">
                        Karnety
                    </Button>
                )}
                {role === 'ADMIN' && (
                    <Button style="navbar" link="/manage-users">
                        Użytkownicy
                    </Button>
                )}
                {/* {role === 'ADMIN' && (
                    <Button style="navbar" link="/manage-offer">
                        Oferta
                    </Button>
                )} */}
                {/* {role === 'ADMIN' && (
                    <Button style="navbar" link="/exercises">
                        Ćwiczenia
                    </Button>
                )} */}
            </div>

            <div className={styles.centerSection}>
            </div>

            <div className={styles.rightSection}>
                {role !== null && (
                    <Button style="navbar" link="/profile">
                        Mój profil
                    </Button>
                )}
                {role !== null && (
                    <Button style="navbar" onClick={handleLogout}>
                        Wyloguj się
                    </Button>
                )}
                {role === null && (
                    <Button style="navbar" link="/login">
                        Zaloguj się
                    </Button>
                )}
                {role === null && (
                    <Button style="navbar" link="/register">
                        Zarejestruj się
                    </Button>
                )}
            </div>


        </nav>
    )
}

export default Navbar