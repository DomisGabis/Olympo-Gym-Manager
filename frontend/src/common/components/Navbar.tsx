import { Link } from "react-router-dom";
import logo from "/olympo-logo.png";
import styles from './Navbar.module.css';
import type { UserRole } from "../../context/AuthContext";

interface Props {
    role: UserRole;
}

function Navbar({ role }: Props) {
    return (
        <nav className={styles.navbar}>
            <div className={styles.leftSection}>
                <Link className={styles.homeLink} to="/">
                    <img className={styles.logo} src={logo} alt="Olympo Logo" />
                    <h1 className={styles.logoText}>Olympo</h1>
                </Link>
            </div>

            <div className={styles.centerSection}>
            </div>

            <div className={styles.rightSection}>
                {role !== null && (
                    <>
                        <Link to="/login">Wyloguj się</Link>
                    </>
                )}
                {role === null && (
                    <>
                        <Link to="/login">Zaloguj się</Link>
                        <Link to="/register">Zarejestruj się</Link>
                    </>
                )}
            </div>
            {role === 'CLIENT' && (
                <Link to="/client">Client Dashboard</Link>
            )}
            {role === 'TRAINER' && (
                <Link to="/trainer">Trainer Dashboard</Link>
            )}
            {role === 'RECEPTIONIST' && (
                <Link to="/receptionist">Receptionist Dashboard</Link>
            )}
            {role === 'ADMIN' && (
                <Link to="/admin">Panel Administratora</Link>
            )}

        </nav>
    )
}

export default Navbar