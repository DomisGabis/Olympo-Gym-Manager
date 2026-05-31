import { useAuth } from '../../context/AuthContext';
import logo from "/olympo-logo.png";
import styles from './HomePage.module.css';
import HomePageCard from './HomePageCard';
import Button from '../../components/Button/Button';
import { useState } from 'react';
import { apiClient } from '../../services/apiClient';
function HomePage() {
    const { user } = useAuth();
    interface QrData {
        qrCodeUrl: string;
        validUntil: string;
    }
    const [qrData, setQrData] = useState<QrData | null>(null);
    const [isQrLoading, setIsQrLoading] = useState<boolean>(false);
    const [qrError, setQrError] = useState<string | null>(null);

    const handleGenerateQr = async () => {
        setIsQrLoading(true);
        setQrError(null);

        try {
            const response = await apiClient.post('/check-in/generate-qr');

            if (response.data.success) {
                setQrData(response.data.data);
            } else {
                setQrError('Nie udało się wygenerować kodu. Spróbuj ponownie.');
            }
        } catch (err) {
            setQrError('Błąd połączenia z serwerem. Upewnij się, że masz aktywny karnet.');
        } finally {
            setIsQrLoading(false);
        }
    };
    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('pl-PL', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const notSignedInRender = (
        <div className={styles.container}>
            <h1>Witaj w Olympo!</h1>
            <img src={logo} className={styles.logo} />
        </div>
    );

    const signedInRender = (
        <div className={styles.container}>
            <h1>Witaj w Olympo, {user?.firstName}!</h1>
            <img src={logo} className={styles.logo} />
            <div className={styles.cardsContainer}>
                <HomePageCard title="Kod QR">
                    {!qrData ? (
                        <Button style="primary" onClick={handleGenerateQr} disabled={isQrLoading} >
                            {isQrLoading ? 'Generowanie...' : 'Wygeneruj kod QR'}
                        </Button>
                    ) : (
                        <div className={styles.qrResult}>
                            <div className={styles.qrWrapper}>
                                <img
                                    src={qrData.qrCodeUrl}
                                    alt="Kod QR Wejścia"
                                    className={styles.qrImage}
                                />
                            </div>

                            <div className={styles.infoBox}>
                                <p className={styles.timerInfo}>
                                    Kod jest ważny do: <strong>{formatDateTime(qrData.validUntil)}</strong>
                                </p>
                                <span className={styles.warningHint}>
                                    * Użyj kodu przy bramce lub pokaż go na recepcji.
                                </span>
                            </div>
                        </div>
                    )}
                </HomePageCard>
                <HomePageCard title="Wejścia w tym miesiącu">
                </HomePageCard>
                <HomePageCard title="Karnet">
                    Masz aktywny karnet ważny do 2024-12-31
                </HomePageCard>
            </div>
        </div>
    );

    return (
        <div className={styles.container}>
            {user ? signedInRender : notSignedInRender}
        </div>
    );
}

export default HomePage