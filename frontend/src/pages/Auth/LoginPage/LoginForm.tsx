import axios from 'axios';
import Button from '../../../components/Button/Button'
import styles from './LoginForm.module.css'
import { apiClient } from '../../../services/apiClient';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

interface Props {
    registerButton?: boolean;
    onSuccess?: () => void;
}

function LoginForm({ registerButton, onSuccess }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await apiClient.post('/auth/login', { email, password });

            if (response.data.success) {

                const token = response.data.data.token;
                const userData = response.data.data.user;

                login(token, userData);
                if (onSuccess) {
                    onSuccess();
                }
                else {
                    navigate('/');
                }
            } else {
                setError(response.data.message || 'Niepoprawne dane logowania.');
            }

        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const backendMessage = err.response?.data?.message;
                setError(backendMessage || 'Niepoprawny e-mail lub hasło.');
            } else {
                setError('Błąd połączenia z serwerem. Upewnij się, że backend działa.');
            }
        }
    };
    return (
        <form onSubmit={handleSubmit} className={styles.form}>
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
            <div className={styles.buttonSection}>
                <Button type="submit" style="primary" >
                    Zaloguj się
                </Button>
                {registerButton ?
                    <Button style="secondary" link="/register">
                        Przejdź do rejestracji
                    </Button> :
                    <></>}
            </div>

        </form>
    )
}

export default LoginForm