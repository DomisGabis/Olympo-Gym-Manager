import { QRCodeSVG } from 'qrcode.react';
import styles from './QrCodeCard.module.css';
import Button from '../../components/Button/Button';

interface Props {
    qrCodeUrl: string;
}

function QrCodeCard({ qrCodeUrl }: Props) {
    return (
        <div className={styles.container}>

            {qrCodeUrl ? (
                <div className={styles.bgWhite}>
                    <QRCodeSVG
                        value={qrCodeUrl}
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
    );
}

export default QrCodeCard;