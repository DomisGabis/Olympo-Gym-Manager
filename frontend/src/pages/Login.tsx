import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    // POPRAWKA: Najpierw sprawdzamy, czy odpowiedź z serwera jest OK (status 200-299)
    if (response.ok) {
      const result = await response.json();
      
      if (result.success) {
        const token = result.data.token;
        const userData = result.data.user;

        login(token, userData);
        navigate('/');
      } else {
        setError(result.message || 'Niepoprawne dane logowania');
      }
    } else {
      // Tutaj wpadamy, gdy wpiszesz ZŁE HASŁO (np. status 401 lub 400)
      // Dzięki temu nie odpalamy .json() na tekście i unikamy błędu w konsoli!
      setError('Niepoprawny e-mail lub hasło.');
    }

  } catch (err) {
    setError('Błąd połączenia z serwerem. Upewnij się, że backend działa.');
  }
};

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', border: '1px solid #ccc' }}>
      <h2>Logowanie do Olympo Gym</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Hasło:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none' }}>
          Zaloguj się
        </button>
      </form>
    </div>
  );
}
export default Login;