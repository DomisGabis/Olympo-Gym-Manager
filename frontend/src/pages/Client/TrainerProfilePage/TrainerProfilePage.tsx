import { useState, useEffect, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import styles from './TrainerProfilePage.module.css';
import Button from '../../../components/Button/Button';
import { ChatBox } from '../../../components/Chatbox/Chatbox';
import { apiClient } from '../../../services/apiClient';
import type { User } from '../../../types/user.types';

function TrainerProfilePage() {
    const { id } = useParams<{ id: string }>();

    const [trainer, setTrainer] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Stany formularza rezerwacji sesji
    const [bookingDate, setBookingDate] = useState<string>('');
    const [bookingTime, setBookingTime] = useState<string>('');
    const [clientMessage, setClientMessage] = useState<string>('');
    const [bookingLoading, setBookingLoading] = useState<boolean>(false);
    const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

    // Fetchowanie profilu trenera
    const fetchTrainerProfile = async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);

            const response = await apiClient.get(`/users/trainers/${id}`);
            console.log(response);

            if (response.data.success) {
                setTrainer(response.data.data);
            } else {
                setError('Nie udało się załadować danych trenera.');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Błąd połączenia z serwerem.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchTrainerProfile();
    }, [id]);

    // Formularz zapisu
    const handleBookingSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setBookingLoading(true);
        setError(null);
        setBookingSuccess(false);

        try {
            // Łączenie daty i czasu w format ISO
            const startDateTime = new Date(`${bookingDate}T${bookingTime}`);
            const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // +1 godzina

            const response = await apiClient.post('/calendar', {
                targetId: id,
                title: clientMessage.trim() || 'Sesja treningowa',
                startAt: startDateTime.toISOString(),
                endAt: endDateTime.toISOString(),
            });

            if (response.data.success) {
                setBookingSuccess(true);
                setBookingDate('');
                setBookingTime('');
                setClientMessage('');
            } else {
                setError(response.data.message || 'Wystąpił błąd podczas rezerwacji.');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Błąd podczas wysyłania rezerwacji.');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) return <div className={styles.centerMessage}>Ładowanie profilu trenera...</div>;
    if (error && !trainer) return <div className={`${styles.centerMessage} ${styles.errorMessage}`}>{error}</div>;
    if (!trainer) return <div className={styles.centerMessage}>Nie znaleziono trenera.</div>;

    const initials = `${trainer.firstName?.charAt(0) || ''}${trainer.lastName?.charAt(0) || ''}`.toUpperCase();
    const fullName = `${trainer.firstName} ${trainer.lastName}`;

    return (
        <div className={styles.pageWrapper}>

            <div className={styles.profileLayoutGrid}>

                {/* LEWA KOLUMNA: Profil + Formularz */}
                <div className={styles.leftColumn}>

                    {/* Wizytówka */}
                    <div className={styles.mainInfoCard}>
                        <div className={styles.avatar}>{initials}</div>
                        <div className={styles.metaText}>
                            <h1 className={styles.trainerName}>{fullName}</h1>
                            <p className={styles.trainerEmail}>{trainer.email}</p>
                        </div>
                    </div>

                    {/* Formularz Zapisu */}
                    <div className={styles.bookingCard}>
                        <h2 className={styles.sectionTitle}>Zarezerwuj sesję</h2>
                        <p className={styles.bookingSubtitle}>Wybierz dogodny termin sesji personalnej.</p>

                        {bookingSuccess && (
                            <div className={styles.successMessage}>
                                ✓ Rezerwacja wysłana! Trener potwierdzi termin.
                            </div>
                        )}
                        {error && bookingSuccess === false && <div className={styles.errorMessage}>{error}</div>}

                        <form onSubmit={handleBookingSubmit} className={styles.bookingForm}>
                            <div className={styles.formRow}>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="bookingDate">Data treningu</label>
                                    <input
                                        id="bookingDate"
                                        type="date"
                                        required
                                        value={bookingDate}
                                        onChange={(e) => setBookingDate(e.target.value)}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="bookingTime">Godzina</label>
                                    <input
                                        id="bookingTime"
                                        type="time"
                                        required
                                        value={bookingTime}
                                        onChange={(e) => setBookingTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="clientMessage">
                                    Nazwa sesji
                                    {/* <span className={styles.optionalHint}>(opcjonalnie)</span> */}
                                </label>
                                <input
                                    id="clientMessage"
                                    className={styles.textareaInput}
                                    placeholder="Podaj nazwę sesji..."
                                    value={clientMessage}
                                    onChange={(e) => setClientMessage(e.target.value)}
                                />
                            </div>

                            <Button
                                type="submit"
                                style="primary"
                                disabled={bookingLoading}
                                className={styles.submitBtn}
                            >
                                {bookingLoading ? 'Wysyłanie...' : 'Wyślij rezerwację'}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* PRAWA KOLUMNA: Wyciągnięty komponent ChatBox */}
                <div className={styles.rightColumn}>
                    {id && (
                        <ChatBox
                            receiverId={id}
                            receiverName={fullName}
                        />
                    )}
                </div>

            </div>
        </div>
    );
}

export default TrainerProfilePage;