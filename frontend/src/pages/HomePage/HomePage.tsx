import { useAuth } from '../../context/AuthContext';
import logo from "/olympo-logo.png";
import styles from './HomePage.module.css';
import HomePageCard from './HomePageCard';
import Button from '../../components/Button/Button';
import { useEffect, useRef, useState } from 'react';
import { apiClient } from '../../services/apiClient';
import QrCodeCard from './QrCodeCard';
function HomePage() {
    const { user } = useAuth();
    interface QrData {
        qrCodeUrl: string;
    }
    const [qrData, setQrData] = useState<QrData | null>(null);
    const [isQrLoading, setIsQrLoading] = useState<boolean>(false);
    const [qrError, setQrError] = useState<string | null>(null);
    const qrTimeoutRef = useRef<number | null>(null);

    const handleGenerateQr = async () => {
        if (qrData) {
            // Jeśli kod QR już istnieje, nie generuj nowego
            return;
        }
        setIsQrLoading(true);
        setQrError(null);

        try {
            if (qrTimeoutRef.current) {
                clearTimeout(qrTimeoutRef.current);
            }
            const response = await apiClient.get('/qr-codes');
            // console.log('Odpowiedź z kodem:', response.data);

            if (response.data.success) {
                setQrData({ qrCodeUrl: response.data.data.qrString });
                qrTimeoutRef.current = setTimeout(() => {
                    setQrData(null);
                    qrTimeoutRef.current = null;
                    // console.log("Kod QR wygasł i został usunięty ze stanu.");
                }, 60 * 1000);
            } else {
                setQrError('Nie udało się wygenerować kodu. Spróbuj ponownie.');
            }
        } catch (err) {
            setQrError('Błąd połączenia z serwerem. Upewnij się, że masz aktywny karnet.');
        } finally {
            setIsQrLoading(false);
        }
    };
    useEffect(() => {
        return () => {
            if (qrTimeoutRef.current) {
                clearTimeout(qrTimeoutRef.current);
            }
        };
    }, []);

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
                <HomePageCard title="Kod QR" onClick={handleGenerateQr}>
                        <div className={styles.qrResult}>
                            <QrCodeCard qrCodeUrl={qrData?.qrCodeUrl || ''} />
                        </div>
                    <p className={styles.qrDescription}>
                        Kod QR jest ważny przez 60 sekund<br /> od momentu wygenerowania
                    </p>
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