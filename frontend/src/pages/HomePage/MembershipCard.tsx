import { useEffect, useState } from 'react';
import HomePageCard from './HomePageCard';
import styles from './MembershipCard.module.css';
import type { Membership } from '../../types/membership.types';
import { apiClient } from '../../services/apiClient';

function MembershipCard() {
    const [membership, setMembership] = useState<Membership | null>(null);


    const fetchMembership = async () => {
        try {
            const response = await apiClient.get('/memberships/my');
            if (response.data.success) {
                // console.log('Odpowiedź z danymi o karnecie:', response.data.data);
                const rawData = response.data.data;
                const mappedMembership: Membership = {
                    ...rawData,
                    startDate: new Date(rawData.startDate),
                    endDate: new Date(rawData.endDate),
                    createdAt: new Date(rawData.createdAt),
                };
                // console.log('Sparsowane dane o karnecie z obiektami Date:', mappedMembership);
                setMembership(mappedMembership);
            } else {
                setMembership(null);
            }
        } catch (error) {
            // console.error('Błąd podczas pobierania danych o karnetach:', error);
            setMembership(null);
        }
    };
    const calculateMembershipDaysLeft = (targetDate: Date | undefined): number => {
        const difference = targetDate ? targetDate.getTime() - new Date().getTime() : 0;
        const days = Math.ceil(difference / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };
    const daysLeft = calculateMembershipDaysLeft(membership?.endDate);
    const isActive = membership?.status === 'ACTIVE';


    useEffect(() => {
        fetchMembership();
    }, []);
    return (
        <HomePageCard title="Karnet">
            {membership ? (
                <div className={styles.container}>
                    <div className={styles.statusGroup}>
                        <span className={`${styles.statusDot} ${isActive ? styles.active : styles.expired}`} />
                        {isActive ? 'Aktywny' : 'Nieaktywny'}
                    </div>

                    <hr />
                    <div className={styles.infoGroup}>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Ważny do</span>
                            <span className={styles.infoValue}>
                                {membership.endDate.toLocaleDateString()}
                            </span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Pozostało</span>
                            <span className={styles.infoValue}>
                                {daysLeft} {daysLeft === 1 ? 'dzień' : 'dni'}
                            </span>
                        </div>
                    </div>
                </div>
            ) : (
                <p className={styles.infoLabel}> Nie masz aktywnego karnetu </p>
            )}
        </HomePageCard>
    );
}

export default MembershipCard