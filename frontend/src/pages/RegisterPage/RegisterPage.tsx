import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from "/olympo-logo.png";
import { apiClient } from '../../services/apiClient';
import styles from './RegisterPage.module.css';
import Button from '../../components/Button/Button';

function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      const response = await apiClient.post('/auth/register', {
        firstName,
        lastName,
        email,
        password
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
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
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <img src={logo} className={styles.logo} />
        <h1 className={styles.title}>Olympo</h1>

        {error && <div className={styles.errorAlert}>{error}</div>}
        {success && (
          <div className={styles.successAlert}>
            Konto utworzone pomyślnie! Przekierowanie...
          </div>
        )}

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
            Zarejestruj się
          </Button>
          <Button style="secondary" link="/login">
            Masz już konto? Zaloguj się
          </Button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;