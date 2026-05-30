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
                {role === 'TRAINER' && (
                    <Button style="navbar" to="/trainer">
                        Panel Trenera
                    </Button>
                )}
                {role === 'RECEPTIONIST' && (
                    <Button style="navbar" to="/receptionist">
                        Panel Recepcjonisty
                    </Button>
                )}
                {role === 'ADMIN' && (
                    <Button style="navbar" to="/admin">
                        Panel Administratora
                    </Button>
                )}
                {role !== null && (
                    <Button style="navbar" onClick={handleLogout}>
                        Wyloguj się
                    </Button>
                )}
                {role === null && (
                    <Button style="navbar" to="/login">
                        Zaloguj się
                    </Button>
                )}
                {role === null && (
                    <Button style="navbar" to="/register">
                        Zarejestruj się
                    </Button>
                )}
            </div>


        </nav>
    )
}

export default Navbar