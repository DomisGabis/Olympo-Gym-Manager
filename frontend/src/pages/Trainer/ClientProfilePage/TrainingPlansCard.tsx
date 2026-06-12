import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import Button from '../../../components/Button/Button';
import Modal from '../../../components/Modal/Modal';
import { TrainingPlanForm } from '../../../components/TrainingPlanForm/TrainingPlanForm';
import styles from './TrainingPlansCard.module.css';
import type { TrainingPlan } from '../../../types/trainingPlan.types';
import { apiClient } from '../../../services/apiClient';

interface Props {
    clientId: string;
    onAddPlan: () => void;
}

export interface TrainingPlansCardHandle {
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

function TrainingPlansCard({ clientId, onAddPlan }: Props, ref: any) {
    const [plans, setPlans] = useState<TrainingPlan[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [editingPlan, setEditingPlan] = useState<TrainingPlan | null>(null);

    const fetchPlans = async () => {
        if (!clientId) return;

        setLoading(true);
        try {
            const response = await apiClient.get(`/clients/${clientId}/training-plans`);

            if (response.data.success) {
                setPlans(response.data.data);
                setError(null);
            } else {
                setError('Nie udało się pobrać planów treningowych.');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Błąd połączenia podczas pobierania planów.');
        } finally {
            setLoading(false);
        }
    };

    useImperativeHandle(ref, () => ({
        refresh: fetchPlans,
    }));

    useEffect(() => {
        fetchPlans();
    }, [clientId]);

    const handleDeletePlan = async (planId: string) => {
        const confirmed = window.confirm('Czy na pewno chcesz usunąć ten plan treningowy?');
        if (!confirmed) return;

        try {
            await apiClient.delete(`/training-plans/${planId}`);
            setPlans((prev) => prev.filter((plan) => plan.id !== planId));
        } catch (err: any) {
            console.error(err);
            window.alert(err.response?.data?.message || 'Nie udało się usunąć planu treningowego.');
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.headerRow}>
                <h3>Plany treningowe</h3>
                <Button style='secondary' type='button' onClick={onAddPlan}>
                    Dodaj nowy
                </Button>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            {loading ? (
                <p className={styles.infoMessage}>Ładowanie planów...</p>
            ) : plans.length === 0 ? (
                <p className={styles.infoMessage}>Klient nie posiada jeszcze żadnych planów.</p>
            ) : (
                <div className={styles.plansList}>
                    {plans.map((plan) => (
                        <div key={plan.id} className={styles.planCard}>
                            <div className={styles.planCardHeader}>
                                <h4 className={styles.planCardTitle}>{plan.title || plan.name || 'Plan treningowy'}</h4>
                                {/* <span className={styles.planBadge}>
                                    {typeof plan.progress === 'number' ? `${plan.progress}%` : 'Brak postępu'}
                                </span> */}
                            </div>

                            <div className={styles.planCardDetails}>
                                <span>Okres: {formatDate(plan.startDate)} – {formatDate(plan.endDate)}</span>
                                <span>Ćwiczeń: {plan.entries?.length ?? 0}</span>
                            </div>

                            <div className={styles.planCardActions}>
                                <Button style='secondary' type='button' onClick={() => setEditingPlan(plan)}>
                                    Edytuj
                                </Button>
                                <Button style='primary' type='button' onClick={() => handleDeletePlan(plan.id)}>
                                    Usuń
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editingPlan && (
                <Modal onClose={() => setEditingPlan(null)}>
                    <TrainingPlanForm
                        existingPlan={editingPlan}
                        clientId={clientId}
                        onSubmit={() => {
                            setEditingPlan(null);
                            fetchPlans();
                        }}
                        onCancel={() => setEditingPlan(null)}
                    />
                </Modal>
            )}
        </div>
    );
}

export default forwardRef(TrainingPlansCard);