import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './TrainerDashboardPage.module.css';
import { apiClient } from '../../../services/apiClient';
import type { User } from '../../../types/user.types';
import Button from '../../../components/Button/Button';

function TrainerDashboardPage() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyClients = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/relationships');
        
        if (response.data.success) {
          // console.log(response.data.data);
          const { clients } = response.data.data;
          const filteredClients = clients.filter((c: { role: string }) => c.role === 'CLIENT');
          setClients(filteredClients);
        } else {
          setError('Nie udało się załadować listy podopiecznych.');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || 'Błąd połączenia z serwerem.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyClients();
  }, []);

  if (loading) return <div className={styles.centerMessage}>Ładowanie listy podopiecznych...</div>;
  if (error) return <div className={`${styles.centerMessage} ${styles.errorMessage}`}>{error}</div>;

  return (
    <div className={styles.dashboardWrapper}>
      {/* Nagłówek sekcji */}
      <div className={styles.headerRow}>
        <div>
          <h1 className='pageTitle'>Moi Podopieczni</h1>
          <p className='pageSubtitle'>
            Zarządzaj swoimi klientami, przeglądaj postępy i odpowiadaj na wiadomości
          </p>
        </div>
        
        {/* Statystyka skrócona */}
        <div className={styles.counterBadge}>
          Suma: <span>{clients.length}</span>
        </div>
      </div>

      {/* Pasek wyszukiwania w stylu dark mode */}
      {/* <div className={styles.searchBarContainer}>
        <input
          type="text"
          placeholder="Szukaj podopiecznego po imieniu, nazwisku lub e-mailu..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div> */}

      {/* Brak wyników */}
      {clients.length === 0 && (
        <div className={styles.emptyState}>
          <p>Nie znaleziono żadnych podopiecznych.</p>
          <span>Upewnij się, że klient zaakceptował Twoje zaproszenie lub wpisz inne kryteria wyszukiwania.</span>
        </div>
      )}

      {/* Siatka kart podopiecznych */}
      <div className={styles.clientsGrid}>
        {clients.map((client) => {
          const initials = `${client.firstName?.charAt(0) || ''}${client.lastName?.charAt(0) || ''}`.toUpperCase();
          
          return (
            <div key={client.id} className={styles.clientCard}>
              {/* Górna część karty z awatarem */}
              <div className={styles.cardHeader}>
                <div 
                  className={styles.avatar}
                  style={{ backgroundColor: '#2a2a2a' }}
                >
                  {initials}
                </div>
                <div className={styles.clientMeta}>
                  <h3 className={styles.clientName}>
                    {client.firstName} {client.lastName}
                  </h3>
                  <span className={styles.clientEmail}>{client.email}</span>
                </div>
              </div>

                <Button
                style='secondary'
                link={`/client/${client.id}`}>
                  Przejdź do profilu
                </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TrainerDashboardPage;