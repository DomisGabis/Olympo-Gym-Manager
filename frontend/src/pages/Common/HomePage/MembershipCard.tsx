import { useEffect, useState } from 'react';
import HomePageCard from './HomePageCard';
import styles from './MembershipCard.module.css';
import type { Membership } from '../../../types/membership.types';
import { apiClient } from '../../../services/apiClient';

function MembershipCard() {
    // 1. Zmiana stanu na tablicę karnetów
    const [memberships, setMemberships] = useState<Membership[]>([]);

    const fetchMemberships = async () => {
        try {
            const response = await apiClient.get('/memberships/my');
            if (response.data.success && Array.isArray(response.data.data)) {
                console.log('Odpowiedź z listą karnetów:', response.data.data);

                // 2. Mapowanie obiektów Date dla całej tablicy
                const mappedMemberships: Membership[] = response.data.data.map((rawData: any) => ({
                    ...rawData,
                    startDate: new Date(rawData.startDate),
                    endDate: new Date(rawData.endDate),
                    createdAt: new Date(rawData.createdAt),
                }));

                setMemberships(mappedMemberships);
            } else {
                setMemberships([]);
            }
        } catch (error) {
            setMemberships([]);
        }
    };

    const calculateMembershipDaysLeft = (targetDate: Date): number => {
        const difference = targetDate.getTime() - new Date().getTime();
        const days = Math.ceil(difference / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };

    useEffect(() => {
        fetchMemberships();
    }, []);

    return (
        <HomePageCard title="Twoje Karnety">
            {memberships.length > 0 ? (
                <div className={styles.container}>
                    {memberships.map((item, index) => {
                        const now = new Date();
                        const isFuture = item.startDate > now;
                        const daysLeft = calculateMembershipDaysLeft(item.endDate);

                        return (
                            <div key={item.id || index} className={styles.membershipItem}>
                                {index > 0 && <hr className={styles.separator} />}

                                <div className={styles.statusGroup}>
                                    <span className={`${styles.statusDot} ${isFuture ? (styles.queued || styles.expired) : styles.active}`} />
                                    {isFuture ? 'Oczekujący' : 'Aktywny'}
                                </div>

                                <div className={styles.infoGroup}>
                                    {!isFuture && (
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoLabel}>Pozostało</span>
                                            <span className={styles.infoValue}>
                                                {daysLeft} {daysLeft === 1 ? 'dzień' : 'dni'}
                                            </span>
                                        </div>
                                    )}
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Typ</span>
                                        <span className={styles.infoValue}>{item.type.replace('_', ' ')}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Ważny od</span>
                                        <span className={styles.infoValue}>
                                            {item.startDate.toLocaleDateString('pl-PL')}
                                        </span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Ważny do</span>
                                        <span className={styles.infoValue}>
                                            {item.endDate.toLocaleDateString('pl-PL')}
                                        </span>
                                    </div>


                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className={styles.infoLabel}> Nie masz aktywnego ani zaplanowanego karnetu </p>
            )}
        </HomePageCard>
    );
}

export default MembershipCard;