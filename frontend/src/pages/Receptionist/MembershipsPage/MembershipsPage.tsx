import React, { useState, useEffect, type FormEvent } from 'react';
import styles from './MembershipsPage.module.css';
import Button from '../../../components/Button/Button';
import { apiClient } from '../../../services/apiClient';
import type { PaginationMeta } from '../../../types/common.types';

// Interfejsy danych
interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
}

interface ActiveMembership {
  id: string;
  planName: string;
  validFrom: string;
  validTo: string;
  status: 'ACTIVE' | 'EXPIRED';
}

function MembershipsPage() {
  // Stany list danych
  const [clients, setClients] = useState<Client[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);

  // Stan wybranego klienta i jego aktualnych karnetów
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeMemberships, setActiveMemberships] = useState<ActiveMembership[]>([]);

  // Stany formularza i wyszukiwania
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [customStartDate, setCustomStartDate] = useState<string>(
    new Date().toISOString().split('T')[0] // Domyślnie dzisiaj
  );

  // Stany UI / błędy
  const [loadingClients, setLoadingClients] = useState<boolean>(true);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(true);
  const [loadingMemberships, setLoadingMemberships] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>({ totalItems: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');

  // 1. Pobierz wszystkich klientów przy wejściu na stronę
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoadingClients(true);
        let url = `/users/clients?page=${currentPage}&limit=10`;
        if (search) url += `&search=${search}`;

        const response = await apiClient.get(url);
        if (response.data.success) {
          setClients(response.data.data);
          setMeta(response.data.meta);
        }
      } catch (error) {
        console.error('Błąd pobierania klientów:', error);
        setError('Nie udało się załadować listy klientów.');
      } finally {
        setLoadingClients(false);
      }
    };

    // 2. Pobierz dostępne rodzaje karnetów w klubie
    const fetchPlans = async () => {
      try {
        setLoadingPlans(true);
        const response = await apiClient.get('/memberships'); // Dostosuj endpoint
        if (response.data.success) {
          setPlans(response.data.data);
        }
      } catch (err) {
        console.error('Błąd pobierania planów karnetów:', err);
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchClients();
    fetchPlans();
  }, []);

  // 3. Pobierz aktywne karnety wybranego klienta po jego kliknięciu
  const fetchClientMemberships = async (clientId: string) => {
    try {
      setLoadingMemberships(true);
      setSuccessMessage(null);
      const response = await apiClient.get(`/clients/${clientId}/memberships`);
      if (response.data.success) {
        setActiveMemberships(response.data.data);
      }
    } catch (err) {
      console.error('Błąd pobierania karnetów klienta:', err);
      setActiveMemberships([]);
    } finally {
      setLoadingMemberships(false);
    }
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setSelectedPlanId('');
    fetchClientMemberships(client.id);
  };

  // 4. Obsługa dodawania karnetu dla wybranego klienta
  const handleAddMembershipSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !selectedPlanId) return;

    try {
      setSubmitLoading(true);
      setError(null);
      setSuccessMessage(null);

      const response = await apiClient.post('/memberships', {
        clientId: selectedClient.id,
        planId: selectedPlanId,
        startDate: customStartDate,
      });

      if (response.data.success) {
        setSuccessMessage('Karnet został pomyślnie aktywowany dla klienta!');
        setSelectedPlanId('');
        // Odśwież listę aktywnych karnetów klienta
        fetchClientMemberships(selectedClient.id);
      } else {
        setError(response.data.message || 'Wystąpił błąd podczas dodawania karnetu.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Błąd połączenia z serwerem.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Filtrowanie listy klientów po wpisaniu tekstu w wyszukiwarkę
  const filteredClients = clients.filter((client) => {
    const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || client.email.toLowerCase().includes(search);
  });

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}>Panel Sprzedaży Karnetów</h1>
        <p className={styles.pageSubtitle}>Wybierz klienta z listy, aby zarządzać jego członkostwem lub przypisać nowy karnet.</p>
      </div>

      <div className={styles.layoutGrid}>

        {/* LEWA SEKCJA: LISTA KLIENTÓW */}
        <div className={styles.leftColumn}>
          <div className={styles.cardContainer}>
            <h2 className={styles.sectionTitle}>Wyszukaj Klienta</h2>
            <input
              type="text"
              placeholder="Wpisz imię, nazwisko lub e-mail..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className={styles.clientsListContainer}>
              {loadingClients ? (
                <div className={styles.loader}>Ładowanie listy klientów...</div>
              ) : filteredClients.length === 0 ? (
                <div className={styles.emptyState}>Brak pasujących klientów.</div>
              ) : (
                filteredClients.map((client) => {
                  const isSelected = selectedClient?.id === client.id;
                  const initials = `${client.firstName.charAt(0)}${client.lastName.charAt(0)}`.toUpperCase();

                  return (
                    <div
                      key={client.id}
                      className={`${styles.clientRow} ${isSelected ? styles.clientRowSelected : ''}`}
                      onClick={() => handleClientSelect(client)}
                    >
                      <div className={styles.clientAvatar}>{initials}</div>
                      <div className={styles.clientInfo}>
                        <span className={styles.clientName}>{client.firstName} {client.lastName}</span>
                        <span className={styles.clientEmail}>{client.email}</span>
                      </div>
                      <div className={styles.actionIndicator}>➔</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* PRAWA SEKCJA: AKTYWNY FORMULARZ I SZCZEGÓŁY */}
        <div className={styles.rightColumn}>
          {selectedClient ? (
            <div className={styles.cardContainer}>
              {/* Profil wybranego klienta */}
              <div className={styles.profileSummary}>
                <h2 className={styles.selectedClientTitle}>
                  {selectedClient.firstName} {selectedClient.lastName}
                </h2>
                <p className={styles.selectedClientSub}>{selectedClient.email} {selectedClient.phoneNumber && `| ${selectedClient.phoneNumber}`}</p>
              </div>

              {/* Informacje o aktualnych karnetach */}
              <div className={styles.membershipsStatusSection}>
                <h3 className={styles.subSectionTitle}>Posiadane karnety</h3>
                {loadingMemberships ? (
                  <div className={styles.loaderSmall}>Sprawdzanie bazy...</div>
                ) : activeMemberships.length === 0 ? (
                  <div className={styles.noMembershipAlert}>
                    Ten użytkownik nie posiada obecnie żadnego aktywnego karnetu.
                  </div>
                ) : (
                  <div className={styles.membershipList}>
                    {activeMemberships.map((membership) => (
                      <div key={membership.id} className={styles.membershipItem}>
                        <div>
                          <span className={styles.planBadge}>{membership.planName}</span>
                          <div className={styles.membershipDates}>
                            Ważny od: {new Date(membership.validFrom).toLocaleDateString('pl-PL')} do {new Date(membership.validTo).toLocaleDateString('pl-PL')}
                          </div>
                        </div>
                        <span className={membership.status === 'ACTIVE' ? styles.statusActive : styles.statusExpired}>
                          {membership.status === 'ACTIVE' ? 'Aktywny' : 'Wygasł'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Formularz dodawania nowego karnetu */}
              <div className={styles.formSection}>
                <h3 className={styles.subSectionTitle}>Dodaj (sprzedaj) nowy karnet</h3>

                {successMessage && <div className={styles.successAlert}>✓ {successMessage}</div>}
                {error && <div className={styles.errorAlert}>✕ {error}</div>}

                <form onSubmit={handleAddMembershipSubmit} className={styles.addForm}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="planSelect">Wybierz rodzaj członkostwa</label>
                    <select
                      id="planSelect"
                      required
                      className={styles.selectInput}
                      value={selectedPlanId}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                      disabled={loadingPlans}
                    >
                      <option value="">-- Wybierz karnet z cennika --</option>
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} ({plan.durationDays} dni) — {plan.price} PLN
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="startDate">Data rozpoczęcia ważności</label>
                    <input
                      id="startDate"
                      type="date"
                      required
                      className={styles.dateInput}
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    style="primary"
                    className={styles.submitButton}
                    disabled={submitLoading || !selectedPlanId}
                  >
                    {submitLoading ? 'Aktywowanie członkostwa...' : 'Potwierdź i dodaj karnet'}
                  </Button>
                </form>
              </div>

            </div>
          ) : (
            <div className={styles.placeholderCard}>
              <h3>Nie wybrano klienta</h3>
              <p>Kliknij na dowolnego klienta z listy po lewej stronie, aby zarządzać jego karnetami lub aktywować nowe członkostwo.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default MembershipsPage;