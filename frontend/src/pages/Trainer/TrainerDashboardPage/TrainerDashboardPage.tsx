import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './TrainerDashboardPage.module.css';
import { apiClient } from '../../../services/apiClient';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarColor?: string;
  joinedAt?: string;
  lastActive?: string;
}

function TrainerDashboardPage() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const fetchMyClients = async () => {
      try {
        setLoading(true);
        // Pobieramy podopiecznych przypisanych do zalogowanego trenera
        const response = await apiClient.get('/trainers/clients');
        
        if (response.data.success) {
          setClients(response.data.data);
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

  // Filtrowanie podopiecznych po imieniu, nazwisku lub emailu
  const filteredClients = clients.filter((client) => {
    const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || client.email.toLowerCase().includes(search);
  });

  if (loading) return <div className={styles.centerMessage}>Ładowanie listy podopiecznych...</div>;
  if (error) return <div className={`${styles.centerMessage} ${styles.errorMessage}`}>{error}</div>;

  return (
    <div className={styles.dashboardWrapper}>
      {/* Nagłówek sekcji */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Moi Podopieczni</h1>
          <p className={styles.pageSubtitle}>
            Zarządzaj swoimi klientami, przeglądaj postępy i odpowiadaj na wiadomości.
          </p>
        </div>
        
        {/* Statystyka skrócona */}
        <div className={styles.counterBadge}>
          Suma: <span>{clients.length}</span>
        </div>
      </div>

      {/* Pasek wyszukiwania w stylu dark mode */}
      <div className={styles.searchBarContainer}>
        <input
          type="text"
          placeholder="Szukaj podopiecznego po imieniu, nazwisku lub e-mailu..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Brak wyników */}
      {filteredClients.length === 0 && (
        <div className={styles.emptyState}>
          <p>Nie znaleziono żadnych podopiecznych.</p>
          <span>Upewnij się, że klient zaakceptował Twoje zaproszenie lub wpisz inne kryteria wyszukiwania.</span>
        </div>
      )}

      {/* Siatka kart podopiecznych */}
      <div className={styles.clientsGrid}>
        {filteredClients.map((client) => {
          const initials = `${client.firstName?.charAt(0) || ''}${client.lastName?.charAt(0) || ''}`.toUpperCase();
          
          return (
            <div key={client.id} className={styles.clientCard}>
              {/* Górna część karty z awatarem */}
              <div className={styles.cardHeader}>
                <div 
                  className={styles.avatar}
                  style={{ backgroundColor: client.avatarColor || '#2a2a2a' }}
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

              {/* Środkowe szczegóły / Info dodatkowe */}
              <div className={styles.cardBody}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>W relacji od:</span>
                  <span className={styles.infoValue}>
                    {client.joinedAt ? new Date(client.joinedAt).toLocaleDateString('pl-PL') : 'Brak danych'}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Ostatnio aktywny:</span>
                  <span className={styles.infoValue}>
                    {client.lastActive ? new Date(client.lastActive).toLocaleDateString('pl-PL') : 'W tym tygodniu'}
                  </span>
                </div>
              </div>

              {/* Przyciski akcji na dole karty */}
              <div className={styles.cardActions}>
                {/* Przycisk czatu przenoszący do widoku, gdzie trener ma wyciągnięty Twój ChatBox */}
                <button 
                  className={styles.chatBtn}
                  onClick={() => navigate(`/trainer/chat/${client.id}`)}
                >
                  💬 Otwórz czat
                </button>
                
                <button 
                  className={styles.profileBtn}
                  onClick={() => navigate(`/trainer/clients/${client.id}`)}
                >
                  Profil
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TrainerDashboardPage;