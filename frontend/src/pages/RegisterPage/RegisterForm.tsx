import axios from 'axios';
import Button from '../../components/Button/Button'
import styles from './RegisterForm.module.css'
import { apiClient } from '../../services/apiClient';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface Props {
    loginButton?: boolean;
    onSuccess?: () => void;
}

function RegisterForm({ loginButton, onSuccess }: Props) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await apiClient.post('/auth/register', {
                firstName,
                lastName,
                email,
                password
            });

            if (response.data.success) {
                if (onSuccess) {
                    onSuccess();
                }
                else {
                    setTimeout(() => {
                        navigate('/login');
                    }, 1000);
                }
            } else {
                setError(response.data.message || 'Nie udało się utworzyć konta.');
            }

        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const backendMessage = err.response?.data?.message;
                setError(backendMessage || 'Błąd podczas rejestracji. Sprawdź wprowadzone dane.');
            } else {
                setError('Błąd połączenia z serwerem. Upewnij się, że backend działa.');
            }
        }
    };
    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formSection}>
                <label className={styles.label}>Imię</label>
                <input
                    type="text"
                    className={`${styles.input} ${error ? styles.inputError : ''}`}
                    placeholder="Imię"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                />
            </div>

            <div className={styles.formSection}>
                <label className={styles.label}>Nazwisko</label>
                <input
                    type="text"
                    className={`${styles.input} ${error ? styles.inputError : ''}`}
                    placeholder="Nazwisko"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                />
            </div>

            <div className={styles.formSection}>
                <label className={styles.label}>Email</label>
                <input
                    type="email"
                    className={`${styles.input} ${error ? styles.inputError : ''}`}
                    placeholder="client@olympo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <div className={styles.formSection}>
                <label className={styles.label}>Hasło</label>
                <input
                    type="password"
                    className={`${styles.input} ${error ? styles.inputError : ''}`}
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            <Button type="submit" style="primary">
                Utwórz konto
            </Button>
            {loginButton ? <Button style="secondary" link="/login">
                Masz już konto? Zaloguj się
            </Button> : <></>
            }
        </form>
    )
}

export default RegisterForm