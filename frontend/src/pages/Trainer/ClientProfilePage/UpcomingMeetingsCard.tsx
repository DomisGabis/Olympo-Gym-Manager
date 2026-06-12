import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import Button from '../../../components/Button/Button';
import Modal from '../../../components/Modal/Modal';
import { MeetingForm } from './MeetingForm';
import styles from './UpcomingMeetingsCard.module.css';
import { apiClient } from '../../../services/apiClient';

interface Meeting {
    id: string;
    title: string;
    startAt: string;
    endAt: string;
    status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
}

interface Props {
    clientId: string;
    onAddMeeting: () => void;
}

export interface UpcomingMeetingsCardHandle {
    refresh: () => Promise<void>;
}

const formatDate = (value?: string) => {
    if (!value) return '-';
    const date = new Date(value);
    return date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};

const formatTime = (value?: string) => {
    if (!value) return '-';
    const date = new Date(value);
    return date.toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getStatusBadgeClass = (status: string) => {
    switch (status) {
        case 'CONFIRMED':
            return styles.statusConfirmed;
        case 'PENDING':
            return styles.statusPending;
        case 'REJECTED':
            return styles.statusRejected;
        default:
            return styles.statusPending;
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'CONFIRMED':
            return 'Potwierdzone';
        case 'PENDING':
            return 'Oczekujące';
        case 'REJECTED':
            return 'Odrzucone';
        default:
            return status;
    }
};

function UpcomingMeetingsCard({ clientId, onAddMeeting }: Props, ref: any) {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMeetings = async () => {
        if (!clientId) return;

        setLoading(true);
        try {
            const response = await apiClient.get(`/calendar/my`);

            if (response.data.success) {
                setMeetings(response.data.data || []);
                setError(null);
            } else {
                setError('Nie udało się pobrać spotkań.');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Błąd połączenia podczas pobierania spotkań.');
        } finally {
            setLoading(false);
        }
    };

    useImperativeHandle(ref, () => ({
        refresh: fetchMeetings,
    }));

    useEffect(() => {
        fetchMeetings();
    }, [clientId]);

    const handleDeleteMeeting = async (meetingId: string) => {
        const confirmed = window.confirm('Czy na pewno chcesz odwołać to spotkanie?');
        if (!confirmed) return;

        try {
            await apiClient.delete(`/calendar/${meetingId}`);
            setMeetings((prev) => prev.filter((meeting) => meeting.id !== meetingId));
        } catch (err: any) {
            console.error(err);
            window.alert(err.response?.data?.message || 'Nie udało się odwołać spotkania.');
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.headerRow}>
                <h3>Nadchodzące spotkania</h3>
                <Button style='secondary' type='button' onClick={onAddMeeting}>
                    Dodaj nowe
                </Button>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            {loading ? (
                <p className={styles.infoMessage}>Ładowanie spotkań...</p>
            ) : meetings.length === 0 ? (
                <p className={styles.infoMessage}>Brak zaplanowanych spotkań.</p>
            ) : (
                <div className={styles.meetingsList}>
                    {meetings.map((meeting) => (
                        <div key={meeting.id} className={styles.meetingCard}>
                            <div className={styles.meetingCardHeader}>
                                <h4 className={styles.meetingCardTitle}>{meeting.title}</h4>
                                <span className={`${styles.statusBadge} ${getStatusBadgeClass(meeting.status)}`}>
                                    {getStatusLabel(meeting.status)}
                                </span>
                            </div>

                            <div className={styles.meetingCardDetails}>
                                <span>Data: {formatDate(meeting.startAt)}</span>
                                <span>Czas: {formatTime(meeting.startAt)} - {formatTime(meeting.endAt)}</span>
                            </div>

                            <div className={styles.meetingCardActions}>
                                <Button style='primary' type='button' onClick={() => handleDeleteMeeting(meeting.id)}>
                                    Odwołaj
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default forwardRef(UpcomingMeetingsCard);
