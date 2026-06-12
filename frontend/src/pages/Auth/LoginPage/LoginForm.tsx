import axios from 'react';
import axiosInstance from 'axios'; // Jeśli używasz globalnego axios, upewnij się o poprawnym imporcie
import Button from '../../../components/Button/Button';
import styles from './LoginForm.module.css';
import { apiClient } from '../../../services/apiClient';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';

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
                } else {
                    navigate('/');
                }
            } else {
                setError(response.data.message || 'Niepoprawne dane logowania.');
            }

        } catch (err: unknown) {
            if (axiosInstance.isAxiosError(err)) {
                const backendMessage = err.response?.data?.message;
                setError(backendMessage || 'Niepoprawny e-mail lub hasło.');
            } else {
                setError('Błąd połączenia z serwerem. Upewnij się, że backend działa.');
            }
        }
    };

    // <-- NOWA FUNKCJA: Obsługa odpowiedzi SSO z Google -->
    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        setError('');
        try {
            const googleToken = credentialResponse.credential;
            if (!googleToken) {
                setError('Nie udało się autoryzować konta przez Google.');
                return;
            }

            // Wysyłamy token do stworzonego wcześniej endpointu na backendzie
            const response = await apiClient.post('/auth/google', { token: googleToken });

            if (response.data.success) {
                const token = response.data.data.token;
                const userData = response.data.data.user;

                // Wstrzykujemy dane do Twojego istniejącego AuthContext
                login(token, userData);

                if (onSuccess) {
                    onSuccess();
                } else {
                    navigate('/');
                }
            } else {
                setError(response.data.message || 'Logowanie przez Google nie powiodło się.');
            }
        } catch (err: unknown) {
            if (axiosInstance.isAxiosError(err)) {
                const backendMessage = err.response?.data?.message;
                setError(backendMessage || 'Wystąpił problem podczas autoryzacji Google na serwerze.');
            } else {
                setError('Błąd serwera podczas logowania przez Google.');
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {/* Wyświetlanie błędu, jeśli istnieje */}
            {error && <div className={styles.errorAlert}>{error}</div>}

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
                <Button type="submit" style="primary">
                    Zaloguj się
                </Button>
                {registerButton ? (
                    <Button style="secondary" link="/register">
                        Przejdź do rejestracji
                    </Button>
                ) : (
                    <></>
                )}
            </div>

            <div className={styles.ssoDivider}>
                <span>lub zaloguj się przez</span>
            </div>

            <div className={styles.googleButtonWrapper}>
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                        setError('Logowanie przez Google zostało przerwane lub wystąpił błąd aplikacji.');
                    }}
                    useOneTap
                />
            </div>
        </form>
    );
}

export default LoginForm;