import { QRCodeSVG } from 'qrcode.react';
import styles from './QrCodeCard.module.css';
import Button from '../../../components/Button/Button';
import HomePageCard from './HomePageCard';
import { useEffect, useRef, useState } from 'react';
import { apiClient } from '../../../services/apiClient';

interface QrData {
    qrCodeUrl: string;
}

function QrCodeCard() {
    const [qrData, setQrData] = useState<QrData | null>(null);
    const [isQrLoading, setIsQrLoading] = useState<boolean>(false);
    const [qrError, setQrError] = useState<string | null>(null);
    const [copied, setCopied] = useState<boolean>(false);
    
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

            if (response.data.success) {
                setQrData({ qrCodeUrl: response.data.data.qrString });
                qrTimeoutRef.current = setTimeout(() => {
                    setQrData(null);
                    qrTimeoutRef.current = null;
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

    const handleCopyToken = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!qrData?.qrCodeUrl) return;

        try {
            await navigator.clipboard.writeText(qrData.qrCodeUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Nie udało się skopiować kodu:', err);
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
                                {isQrLoading ? 'Generowanie...' : <>Wygeneruj<br /> kod QR</>}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.qrTextSection}>
                <span className={styles.qrText}>
                    {qrData ? qrData.qrCodeUrl : <span className={styles.placeholderText}>Oczekiwanie na kod...</span>}
                </span>
                {qrData && (
                    <button 
                        type="button" 
                        className={`${styles.copyBtn} ${copied ? styles.copyBtnSuccess : ''}`} 
                        onClick={handleCopyToken}
                        title={copied ? "Skopiowano!" : "Kopiuj do schowka"}
                    >
                        {copied ? (
                            // Ikona sukcesu (Checkmark)
                            <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        ) : (
                            // Ikona kopiowania (Dwa nakładające się arkusze)
                            <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        )}
                    </button>
                )}
            </div>

            <p className={styles.infoLabel}>
                Kod QR jest ważny przez {QR_VALIDITY_SECONDS} sekund<br /> od momentu wygenerowania
            </p>
            {qrError && <p className={styles.qrErrorText}>{qrError}</p>}
        </HomePageCard>
    );
}

export default QrCodeCard;