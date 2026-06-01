import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import logo from "/olympo-logo.png";
import { apiClient } from '../../services/apiClient';
import styles from './LoginPage.module.css';
import Button from '../../components/Button/Button';

function LoginPage() {
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
        navigate('/');
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
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <img src={logo} className={styles.logo} />
        <h1 className={styles.title}>Olympo</h1>

        {error && <div className={styles.errorAlert}>{error}</div>}

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

          <Button type="submit" style="primary" >
            Zaloguj się
          </Button>
          <Button style="secondary" link="/register">
            Przejdź do rejestracji
          </Button>
        </form>
      </div>
    </div>
  );
}
export default LoginPage;