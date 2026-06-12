import { FormEvent, useState } from 'react';
import Button from '../../../components/Button/Button';
import styles from './MeetingForm.module.css';
import { apiClient } from '../../../services/apiClient';

interface Props {
    clientId: string;
    onSubmit?: () => void;
    onCancel?: () => void;
}

export function MeetingForm({ clientId, onSubmit, onCancel }: Props) {
    const [meetingDate, setMeetingDate] = useState<string>('');
    const [meetingStartTime, setMeetingStartTime] = useState<string>('');
    const [meetingEndTime, setMeetingEndTime] = useState<string>('');
    const [meetingTitle, setMeetingTitle] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            if (!meetingDate || !meetingStartTime || !meetingEndTime || !meetingTitle.trim()) {
                setError('Wszystkie pola są wymagane.');
                setLoading(false);
                return;
            }

            // Construir startAt i endAt (kombinacja daty i godziny)
            const startAt = `${meetingDate}T${meetingStartTime}:00`;
            const endAt = `${meetingDate}T${meetingEndTime}:00`;

            // Validacja: startAt <= endAt
            if (new Date(startAt) >= new Date(endAt)) {
                setError('Godzina rozpoczęcia musi być przed godziną zakończenia.');
                setLoading(false);
                return;
            }

            const response = await apiClient.post('/calendar', {
                targetId: clientId,
                title: meetingTitle.trim(),
                startAt,
                endAt,
            });

            if (response.data.success) {
                setSuccess(true);
                setMeetingDate('');
                setMeetingStartTime('');
                setMeetingEndTime('');
                setMeetingTitle('');
                setTimeout(() => {
                    onSubmit?.();
                }, 500);
            } else {
                setError(response.data.message || 'Błąd podczas dodawania spotkania.');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Błąd podczas dodawania spotkania.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.formContainer}>
            <h2 className={styles.formTitle}>Umów nowe spotkanie</h2>

            {success && (
                <div className={styles.successMessage}>
                    ✓ Spotkanie zostało pomyślnie dodane!
                </div>
            )}
            {error && <div className={styles.errorMessage}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                    <label htmlFor="meetingTitle">Nazwa spotkania</label>
                    <input
                        id="meetingTitle"
                        type="text"
                        required
                        placeholder="Np. Trening siłowy, Streching..."
                        value={meetingTitle}
                        onChange={(e) => setMeetingTitle(e.target.value)}
                    />
                </div>

                <div className={styles.dateTimeRow}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="meetingDate">Data</label>
                        <input
                            id="meetingDate"
                            type="date"
                            required
                            value={meetingDate}
                            onChange={(e) => setMeetingDate(e.target.value)}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="meetingStartTime">Godzina rozpoczęcia</label>
                        <input
                            id="meetingStartTime"
                            type="time"
                            required
                            value={meetingStartTime}
                            onChange={(e) => setMeetingStartTime(e.target.value)}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="meetingEndTime">Godzina zakończenia</label>
                        <input
                            id="meetingEndTime"
                            type="time"
                            required
                            value={meetingEndTime}
                            onChange={(e) => setMeetingEndTime(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.buttonGroup}>
                    <Button type="submit" style="primary" disabled={loading} className={styles.submitBtn}>
                        {loading ? 'Dodawanie...' : 'Dodaj spotkanie'}
                    </Button>
                    {onCancel && (
                        <Button type="button" style="secondary" onClick={onCancel}>
                            Anuluj
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
}
