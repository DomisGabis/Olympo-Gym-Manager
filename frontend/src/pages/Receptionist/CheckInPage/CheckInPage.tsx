import React, { useState, useRef, useEffect } from 'react';
import styles from './CheckInPage.module.css';
import Button from '../../../components/Button/Button';
import { apiClient } from '../../../services/apiClient';

type Mode = 'CHECK_IN' | 'CHECK_OUT';

interface AlertState {
  type: 'success' | 'error' | null;
  text: string;
}

function CheckInPage() {
  const [mode, setMode] = useState<Mode>('CHECK_IN');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({ type: null, text: '' });
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Automatyczne ustawianie focusu na polu tekstowym dla wygody recepcjonisty
  useEffect(() => {
    focusInput();
  }, [mode]);

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setInputValue('');
    setAlert({ type: null, text: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setLoading(true);
    setAlert({ type: null, text: '' });

    try {
      if (mode === 'CHECK_IN') {
        // POST /api/club-entries z { qrCode }
        const response = await apiClient.post('/club-entries', { qrCode: inputValue.trim() });
        
        if (response.data.success) {
          setAlert({
            type: 'success',
            text: `Pomyślnie zarejestrowano WEJŚCIE. Użytkownik: ${response.data.data?.user?.firstName || ''} ${response.data.data?.user?.lastName || ''}`
          });
          setInputValue(''); // Czyszczenie pola pod kolejny skan
        }
      } else {
        // PATCH /api/club-entries z { userId }
        const response = await apiClient.patch('/club-entries', { userId: inputValue.trim() });
        
        if (response.data.success) {
          setAlert({
            type: 'success',
            text: `Pomyślnie zarejestrowano WYJŚCIE.`
          });
          setInputValue('');
        }
      }
    } catch (error: any) {
      console.error('Błąd rejestracji wpisu:', error);
      setAlert({
        type: 'error',
        text: error.response?.data?.message || 'Wystąpił błąd podczas komunikacji z serwerem.'
      });
    } finally {
      setLoading(false);
      setInputValue('');
      // Przywróć focus na pole po zakończeniu żądania, aby recepcjonista mógł od razu skanować dalej
      setTimeout(focusInput, 50);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.headerSection}>
        <h1 className="pageTitle">Zarządzanie wejściami do klubu</h1>
        <p className="pageSubtitle">Zeskanuj kod QR lub wprowadź dane ręcznie, aby zarejestrować obecność</p>
      </div>

      {/* Przełącznik trybów (Tabs) */}
      <div className={styles.modeTabs}>
        <button
          className={`${styles.tabBtn} ${mode === 'CHECK_IN' ? styles.activeTab : ''}`}
          onClick={() => handleModeChange('CHECK_IN')}
          type="button"
        >
          ⬇ Wejście (Check-in)
        </button>
        <button
          className={`${styles.tabBtn} ${mode === 'CHECK_OUT' ? styles.activeTab : ''}`}
          onClick={() => handleModeChange('CHECK_OUT')}
          type="button"
        >
          ⬆ Wyjście (Check-out)
        </button>
      </div>

      <div className={styles.scannerCard}>
        <form onSubmit={handleSubmit} className={styles.scanForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="scan-input" className={styles.inputLabel}>
              {mode === 'CHECK_IN' ? 'Kod QR użytkownika:' : 'Identyfikator użytkownika:'}
            </label>
            
            <div className={styles.interactiveArea}>
              <input
                id="scan-input"
                ref={inputRef}
                type="text"
                className={styles.scanInput}
                placeholder={mode === 'CHECK_IN' ? "Zeskanuj QR lub wpisz kod..." : "Zeskanuj QR lub wpisz ID..."}
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

        {/* Informacja pomocnicza dla recepcjonisty */}
        <p className={styles.hintText} onClick={focusInput}>
          Kliknij tutaj, jeśli skaner nie reaguje (pole tekstowe musi być aktywne).
        </p>
      </div>

      {/* Sekcja komunikatów / Wynik weryfikacji */}
      {alert.type && (
        <div className={`${styles.alertBox} ${styles[alert.type]}`}>
          <div className={styles.alertIcon}>
            {alert.type === 'success' ? '✅' : '❌'}
          </div>
          <div className={styles.alertText}>
            <h3>{alert.type === 'success' ? 'Sukces' : 'Odmowa dostępu / Błąd'}</h3>
            <p>{alert.text}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckInPage;