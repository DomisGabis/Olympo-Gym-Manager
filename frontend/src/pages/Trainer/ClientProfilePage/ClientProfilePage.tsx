import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import styles from './ClientProfilePage.module.css';
import { ChatBox } from '../../../components/Chatbox/Chatbox';
import { apiClient } from '../../../services/apiClient';
import type { User } from '../../../types/user.types';
import TrainingPlansCard, { type TrainingPlansCardHandle } from './TrainingPlansCard';
import UpcomingMeetingsCard, { type UpcomingMeetingsCardHandle } from './UpcomingMeetingsCard';
import Modal from '../../../components/Modal/Modal';
import { TrainingPlanForm } from '../../../components/TrainingPlanForm/TrainingPlanForm';
import { MeetingForm } from './MeetingForm';
import type { TrainingPlan } from '../../../types/trainingPlan.types';

function ClientProfilePage() {
    const { id } = useParams<{ id: string }>();
    const trainingPlansCardRef = useRef<TrainingPlansCardHandle>(null);
    const upcomingMeetingsCardRef = useRef<UpcomingMeetingsCardHandle>(null);

    const [client, setClient] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [addingTrainingPlan, setAddingTrainingPlan] = useState<boolean>(false);
    const [addingMeeting, setAddingMeeting] = useState<boolean>(false);

    const fetchClientProfile = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/relationships`);
            if (response.data.success) {
                const foundTrainer = response.data.data.clients.find((item: any) => item.id === id);
                setClient(foundTrainer || null);
            } else {
                setError('Nie udało się załadować profilu klienta.');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Błąd połączenia z serwerem.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchClientProfile();
    }, [id]);

    if (loading) return <div className={styles.centerMessage}>Ładowanie profilu klienta...</div>;
    if (error && !client) return <div className={`${styles.centerMessage} ${styles.errorMessage}`}>{error}</div>;
    if (!client) return <div className={styles.centerMessage}>Nie znaleziono klienta.</div>;

    const initials = `${client.firstName?.charAt(0) || ''}${client.lastName?.charAt(0) || ''}`.toUpperCase();
    const fullName = `${client.firstName} ${client.lastName}`;

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.profileLayoutGrid}>
                <div className={styles.leftColumn}>
                    <div className={styles.mainInfoCard}>
                        <div className={styles.avatar}>{initials}</div>
                        <div className={styles.metaText}>
                            <h1 className={styles.trainerName}>{fullName}</h1>
                            <p className={styles.trainerEmail}>{client.email}</p>
                        </div>
                    </div>

                    {id ? (
                        <TrainingPlansCard
                            ref={trainingPlansCardRef}
                            clientId={id}
                            onAddPlan={() => setAddingTrainingPlan(true)}
                        />
                    ) : null}

                    {id ? (
                        <UpcomingMeetingsCard
                            ref={upcomingMeetingsCardRef}
                            clientId={id}
                            onAddMeeting={() => setAddingMeeting(true)}
                        />
                    ) : null}
                </div>

                <div className={styles.rightColumn}>
                    {id && <ChatBox receiverId={id} receiverName={fullName} />}
                </div>
            </div>

            {addingTrainingPlan && (
                <Modal onClose={() => setAddingTrainingPlan(false)}>
                    <TrainingPlanForm
                        existingPlan={null}
                        clientId={id ?? ''}
                        onSubmit={() => {
                            setAddingTrainingPlan(false);
                            trainingPlansCardRef.current?.refresh();
                        }}
                    />
                </Modal>
            )}

            {addingMeeting && (
                <Modal onClose={() => setAddingMeeting(false)}>
                    <MeetingForm
                        clientId={id ?? ''}
                        onSubmit={() => {
                            setAddingMeeting(false);
                            upcomingMeetingsCardRef.current?.refresh();
                        }}
                        onCancel={() => setAddingMeeting(false)}
                    />
                </Modal>
            )}
        </div>
    );
}

export default ClientProfilePage;
