import React, { useState, useRef, useEffect } from 'react';
import styles from './CheckInPage.module.css';
import Button from '../../../components/Button/Button';
import { apiClient } from '../../../services/apiClient';

interface AlertState {
  type: 'success' | 'error' | null;
  text: string;
}

function CheckInPage() {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({ type: null, text: '' });
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Automatyczne ustawianie focusu na polu tekstowym przy ładowaniu strony
  useEffect(() => {
    focusInput();
  }, []);

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setLoading(true);
    setAlert({ type: null, text: '' });

    try {
      // Wysyłamy zawsze POST z parametrem qrCode
      const response = await apiClient.post('/club-entries', { qrCode: inputValue.trim() });
      
      if (response.data.success) {
        setAlert({
          type: 'success',
          text: response.data.message // Komunikat dynamiczny prosto z backendu (Wejście lub Wyjście)
        });
        setInputValue(''); // Czyszczenie pola pod kolejny natychmiastowy skan
      }
    } catch (error: any) {
      console.error('Błąd rejestracji obecności:', error);
      setAlert({
        type: 'error',
        text: error.response?.data?.message || 'Wystąpił błąd podczas komunikacji z serwerem.'
      });
    } finally {
      setLoading(false);
      setInputValue('');
      // Przywrócenie focusu natychmiast po operacji dla ciągłości skanowania
      setTimeout(focusInput, 50);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.headerSection}>
        <h1 className="pageTitle">Zarządzanie obecnością w klubie</h1>
        <p className="pageSubtitle">Zeskanuj kod QR użytkownika, aby zarejestrować jego wejście lub wyjście</p>
      </div>

      <div className={styles.scannerCard}>
        <form onSubmit={handleSubmit} className={styles.scanForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="scan-input" className={styles.inputLabel}>
              Kod QR użytkownika:
            </label>
            
            <div className={styles.interactiveArea}>
              <input
                id="scan-input"
                ref={inputRef}
                type="text"
                className={styles.scanInput}
                placeholder="Zeskanuj aktywny kod QR z aplikacji klienta..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={loading}
                autoComplete="off"
              />
              <Button 
                style='primary' 
                type="submit"
                disabled={loading || !inputValue.trim()}
              >
                {loading ? 'Weryfikacja...' : 'Zatwierdź'}
              </Button>
            </div>
          </div>
        </form>

        <p className={styles.hintText} onClick={focusInput}>
          Kliknij tutaj, jeśli skaner nie reaguje (pole tekstowe musi być aktywne, by przyjąć sygnał ze skanera).
        </p>
      </div>

      {/* Komunikat o sukcesie bądź błędzie */}
      {alert.type && (
        <div className={`${styles.alertBox} ${styles[alert.type]}`}>
          <div className={styles.alertIcon}>
            {alert.type === 'success' ? '✅' : '❌'}
          </div>
          <div className={styles.alertText}>
            <h3>{alert.type === 'success' ? 'Status Rejestracji' : 'Odmowa dostępu / Błąd'}</h3>
            <p>{alert.text}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckInPage;