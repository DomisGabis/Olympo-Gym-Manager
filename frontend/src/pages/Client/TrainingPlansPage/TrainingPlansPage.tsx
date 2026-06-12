import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './TrainingPlansPage.module.css';
import Button from '../../../components/Button/Button';
import { apiClient } from '../../../services/apiClient';

interface TrainingEntry {
  id: string;
  exercise: string;
  sets: number;
  reps: number;
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

function TrainingPlansPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/training-plans/my');
      if (response.data.success) {
        setPlans(response.data.data || []);
      } else {
        setError('Nie udało się pobrać planów treningowych.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Błąd podczas pobierania planów.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDeletePlan = async (planId: string) => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten plan treningowy?')) return;

    try {
      setDeletingId(planId);
      await apiClient.delete(`/training-plans/${planId}`);
      setPlans(plans.filter(p => p.id !== planId));
    } catch (err: any) {
      console.error(err);
      window.alert(err.response?.data?.message || 'Nie udało się usunąć planu.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleResetProgress = async (planId: string) => {
    if (!window.confirm('Czy na pewno chcesz zresetować postęp tego planu?')) return;

    try {
      setResettingId(planId);
      const response = await apiClient.post(`/training-plans/${planId}/reset`, {});
      if (response.data.success) {
        const updatedPlans = plans.map(p =>
          p.id === planId ? { ...p, progress: 0, entries: p.entries.map(e => ({ ...e, isCompleted: false })) } : p
        );
        setPlans(updatedPlans);
      }
    } catch (err: any) {
      console.error(err);
      window.alert(err.response?.data?.message || 'Nie udało się zresetować postępu.');
    } finally {
      setResettingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const isExpired = (endDate: string) => new Date(endDate) < new Date();

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className="pageTitle">Moje Plany Treningowe</h1>
          <p className="pageSubtitle">Przeglądaj swoje plany treningowe i śledź postęp treningów.</p>
        </div>
        <div className={styles.counterBadge}>
          Łącznie: <span>{plans.length}</span>
        </div>
      </div>

      {loading ? (
        <div className={styles.centerMessage}>Ładowanie planów treningowych...</div>
      ) : error ? (
        <div className={`${styles.centerMessage} ${styles.errorMessage}`}>{error}</div>
      ) : plans.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Nie masz jeszcze żadnych planów treningowych.</p>
          <span>Skontaktuj się z trenerem, aby otrzymać swój pierwszy plan!</span>
        </div>
      ) : (
        <div className={styles.plansGrid}>
          {plans.map((plan) => (
            <div key={plan.id} className={styles.planCard}>
              {/* Nagłówek karty */}
              <div className={styles.cardHeader}>
                <div className={styles.headerInfo}>
                  <h2 className={styles.planTitle}>{plan.title}</h2>
                  <p className={styles.trainerName}>
                    {plan.relation.trainer.firstName} {plan.relation.trainer.lastName}
                  </p>
                </div>
                {isExpired(plan.endDate) && <span className={styles.expiredBadge}>Wygasł</span>}
              </div>

              {/* Daty */}
              <div className={styles.dateRow}>
                <span className={styles.dateLabel}>
                  <strong>Od:</strong> {formatDate(plan.startDate)}
                </span>
                <span className={styles.dateLabel}>
                  <strong>Do:</strong> {formatDate(plan.endDate)}
                </span>
              </div>

              {/* Pasek postępu */}
              <div className={styles.progressSection}>
                <div className={styles.progressLabel}>
                  <span>Postęp</span>
                  <span className={styles.progressValue}>{plan.progress}%</span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${plan.progress}%` }}
                  />
                </div>
              </div>

              {/* Statystyka ćwiczeń */}
              <div className={styles.statsRow}>
                <span>Ćwiczenia: <strong>{plan.entries.length}</strong></span>
                <span>Ukończone: <strong>{plan.entries.filter(e => e.isCompleted).length}</strong></span>
              </div>

              {/* Działania */}
              <div className={styles.actionButtons}>
                <Button
                  style="primary"
                  className={styles.viewBtn}
                  onClick={() => navigate(`/training-plans/${plan.id}`)}
                >
                  Szczegóły
                </Button>
                <Button
                  style="secondary"
                  disabled={resettingId === plan.id}
                  onClick={() => handleResetProgress(plan.id)}
                >
                  {resettingId === plan.id ? 'Resetowanie...' : 'Reset'}
                </Button>
                <Button
                  style="secondary"
                  disabled={deletingId === plan.id}
                  onClick={() => handleDeletePlan(plan.id)}
                >
                  {deletingId === plan.id ? 'Usuwanie...' : 'Usuń'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrainingPlansPage;
