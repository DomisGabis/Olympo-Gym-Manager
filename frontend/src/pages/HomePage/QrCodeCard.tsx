import { QRCodeSVG } from 'qrcode.react';
import styles from './QrCodeCard.module.css';
import Button from '../../components/Button/Button';
import HomePageCard from './HomePageCard';
import { useEffect, useRef, useState } from 'react';
import { apiClient } from '../../services/apiClient';
interface QrData {
    qrCodeUrl: string;
}
function QrCodeCard() {
    const [qrData, setQrData] = useState<QrData | null>(null);
    const [isQrLoading, setIsQrLoading] = useState<boolean>(false);
    const [qrError, setQrError] = useState<string | null>(null);
    const qrTimeoutRef = useRef<number | null>(null);
    const QR_VALIDITY_SECONDS = 60;

    const handleGenerateQr = async () => {
        if (qrData) {
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
                }, QR_VALIDITY_SECONDS * 1000);
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

    return (
        <HomePageCard title="Kod QR" onClick={handleGenerateQr}>
            <div className={styles.qrResult}>
                <div className={styles.container}>

                    {qrData ? (
                        <div className={styles.bgWhite}>
                            <QRCodeSVG
                                value={qrData.qrCodeUrl}
                                size={220}
                                bgColor="#FFFFFF"
                                fgColor="#000000"
                                level="M"
                                includeMargin={true}
                            />
                        </div>
                    ) : (
                        <div className={styles.bgDark}>
                            <Button style="secondary" className={styles.noQrButton}>
                                Wygeneruj<br /> kod QR
                            </Button>
                        </div>
                    )}

                </div>
            </div>
            <p className={styles.infoLabel}>
                Kod QR jest ważny przez {QR_VALIDITY_SECONDS} sekund<br /> od momentu wygenerowania
            </p>
        </HomePageCard>);
}

export default QrCodeCard;