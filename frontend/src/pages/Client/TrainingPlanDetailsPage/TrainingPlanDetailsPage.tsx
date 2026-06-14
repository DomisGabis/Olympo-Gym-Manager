import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './TrainingPlanDetailsPage.module.css';
import Button from '../../../components/Button/Button';
import { apiClient } from '../../../services/apiClient';

// Dopasowanie interfejsów do Twojego modelu danych
interface TrainingEntry {
    id: string;
    dayOfWeek: string;
    exercise: string;
    setsCount: number;
    repsRange: number;
    weight?: number;
    isCompleted: boolean;
}

interface TrainingPlan {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    progress: number;
    entries: TrainingEntry[];
    relation: {
        trainer: { firstName: string; lastName: string; email: string };
    };
}

function TrainingPlanDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const daysDict = {
        MONDAY: 'Poniedziałek',
        TUESDAY: 'Wtorek',
        WEDNESDAY: 'Środa',
        THURSDAY: 'Czwartek',
        FRIDAY: 'Piątek',
        SATURDAY: 'Sobota',
        SUNDAY: 'Niedziela',
    }

    const [plan, setPlan] = useState<TrainingPlan | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null); // Id wpisu, który aktualnie zapisujemy

    // Pobranie szczegółów konkretnego planu
    const fetchPlanDetails = async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            // 1. Pobieramy wszystkie plany zalogowanego klienta
            const response = await apiClient.get('/training-plans/my');

            if (response.data.success) {
                const allPlans: TrainingPlan[] = response.data.data || [];

                // 2. Szukamy planu o ID pasującym do tego z adresu URL
                const specificPlan = allPlans.find((p) => p.id === id);

                if (specificPlan) {
                    // console.log(specificPlan);
                    // 3. Jeśli go znaleźliśmy, wrzucamy do stanu
                    setPlan(specificPlan);
                } else {
                    // Obsługa sytuacji, gdy ktoś wpisze złe ID w pasku przeglądarki
                    setError('Nie znaleziono takiego planu treningowego na Twoim koncie.');
                }
            } else {
                setError('Nie udało się pobrać listy planów.');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Błąd podczas ładowania szczegółów planu.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlanDetails();
    }, [id]);

    // Obsługa odhaczania (toggle) ćwiczenia
    const handleToggleExercise = async (entryId: string, currentStatus: boolean) => {
        if (!plan || !id) return;

        try {
            setTogglingId(entryId);

            // Wywołanie API do zmiany statusu (dostosuj endpoint pod swój backend, np. /entries/:id/toggle)
            const response = await apiClient.patch(`/training-plans/entry/${entryId}/toggle`, {
                isCompleted: !currentStatus
            });

            if (response.data.success) {
                // Aktualizujemy stan lokalny: zmieniamy isCompleted dla danego ćwiczenia
                const updatedEntries = plan.entries.map(entry =>
                    entry.id === entryId ? { ...entry, isCompleted: !currentStatus } : entry
                );

                // Wyliczamy nowy postęp na żywo, żeby klient od razu widział efekt
                const completedCount = updatedEntries.filter(e => e.isCompleted).length;
                const newProgress = updatedEntries.length > 0
                    ? Math.round((completedCount / updatedEntries.length) * 100)
                    : 0;

                setPlan({
                    ...plan,
                    progress: newProgress,
                    entries: updatedEntries
                });
            }
        } catch (err: any) {
            console.error(err);
            window.alert(err.response?.data?.message || 'Nie udało się zaktualizować statusu ćwiczenia.');
        } finally {
            setTogglingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (loading) {
        return <div className={styles.centerMessage}>Ładowanie szczegółów planu...</div>;
    }

    if (error || !plan) {
        return (
            <div className={styles.pageWrapper}>
                <div className={`${styles.centerMessage} ${styles.errorMessage}`}>{error || 'Nie znaleziono planu.'}</div>
                <Button style="secondary" onClick={() => navigate('/training-plans')}>Powrót do listy</Button>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>

            <div className={styles.mainLayout}>
                {/* LEWA KOLUMNA: Szczegóły i postęp */}
                <div className={styles.metaColumn}>
                    <div className={styles.infoCard}>
                        <h1 className={styles.planTitle}>{plan.title}</h1>
                        <p className={styles.trainerInfo}>
                            Trener: <strong>{plan.relation.trainer.firstName} {plan.relation.trainer.lastName}</strong>
                        </p>

                        <div className={styles.datesBox}>
                            <div><span>Od:</span> {formatDate(plan.startDate)}</div>
                            <div><span>Do:</span> {formatDate(plan.endDate)}</div>
                        </div>

                        <div className={styles.progressSection}>
                            <div className={styles.progressLabel}>
                                <span>Twój postęp</span>
                                <span className={styles.progressValue}>{plan.progress}%</span>
                            </div>
                            <div className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{ width: `${plan.progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* PRAWA KOLUMNA: Lista ćwiczeń do zrobienia */}
                <div className={styles.exercisesColumn}>
                    <h2 className={styles.sectionTitle}>Lista ćwiczeń do wykonania</h2>

                    <div className={styles.exercisesList}>
                        {plan.entries.map((entry) => (
                            <div
                                key={entry.id}
                                className={`${styles.exerciseCard} ${entry.isCompleted ? styles.completedCard : ''}`}
                            >
                                <div className={styles.exerciseInfo}>
                                    <h3 className={styles.exerciseName}>
                                        {(entry.exercise as any).name}
                                    </h3>

                                    <div className={styles.exerciseSpecs}>
                                        <span className={styles.specItem}>Dzień: <strong>{daysDict[entry.dayOfWeek as keyof typeof daysDict]}</strong></span>
                                        <span className={styles.specItem}>Serie: <strong>{entry.setsCount}</strong></span>
                                        <span className={styles.specItem}>Powtórzenia: <strong>{entry.repsRange}</strong></span>
                                        {entry.weight && (
                                            <span className={styles.specItem}>Ciężar: <strong>{entry.weight} kg</strong></span>
                                        )}
                                    </div>
                                </div>

                                {/* Status / Checkbox dedykowany dla klienta */}
                                <Button
                                    type="button"
                                    disabled={togglingId === entry.id}
                                    style='secondary'
                                    className={`${styles.statusToggleBtn} ${entry.isCompleted ? styles.btnCompleted : styles.btnPending}`}
                                    onClick={() => handleToggleExercise(entry.id, entry.isCompleted)}
                                >
                                    {togglingId === entry.id ? (
                                        <span className={styles.spinner}>...</span>
                                    ) : entry.isCompleted ? (
                                        '✓ Ukończone'
                                    ) : (
                                        'Odznacz'
                                    )}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TrainingPlanDetailsPage;