import React, { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../../../services/apiClient';
import Button from '../../../components/Button/Button';
import styles from './CalendarPage.module.css';

interface CalendarEntry {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  relation: {
    client?: { firstName: string; lastName: string; email: string };
    trainer?: { firstName: string; lastName: string; email: string };
  };
}

const getMonthMatrix = (year: number, month: number) => {
  const firstDayOfMonth = new Date(year, month, 1);
  const firstWeekday = firstDayOfMonth.getDay();
  const mondayOffset = firstWeekday === 0 ? 6 : firstWeekday - 1;
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(firstDayOfMonth.getDate() - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return date;
  });
};

const formatTime = (value: string) => {
  const date = new Date(value);
  return date.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const isSameDay = (a: Date, b: Date) =>
  a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

const CalendarPage = () => {
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchCalendar = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/calendar/my');
      if (response.data.success) {
        setEntries(response.data.data || []);
      } else {
        setError('Nie udało się pobrać kalendarza.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Błąd podczas pobierania kalendarza.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, []);

  const monthMatrix = useMemo(
    () => getMonthMatrix(currentMonth.getFullYear(), currentMonth.getMonth()),
    [currentMonth]
  );

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>();
    entries.forEach((entry) => {
      // Wyświetlaj tylko potwierdzone spotkania w kalendarzu
      if (entry.status === 'CONFIRMED') {
        const dayKey = new Date(entry.startAt).toDateString();
        const events = map.get(dayKey) || [];
        events.push(entry);
        map.set(dayKey, events);
      }
    });
    return map;
  }, [entries]);

  const pendingEntries = useMemo(
    () => entries.filter((entry) => entry.status === 'PENDING'),
    [entries]
  );

  const changeMonth = (delta: number) => {
    const next = new Date(currentMonth);
    next.setMonth(currentMonth.getMonth() + delta);
    setCurrentMonth(next);
  };

  const handleStatusChange = async (entryId: string, status: 'CONFIRMED' | 'REJECTED') => {
    try {
      setActionLoading(entryId);
      await apiClient.patch(`/calendar/${entryId}/status`, { status });
      await fetchCalendar();
    } catch (err: any) {
      console.error(err);
      window.alert(err.response?.data?.message || 'Nie udało się zaktualizować statusu.');
    } finally {
      setActionLoading(null);
    }
  };

  const monthLabel = currentMonth.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
  const today = new Date();

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className="pageTitle">Kalendarz trenera</h1>
          <p className="pageSubtitle">Przeglądaj swój plan miesięczny i akceptuj spotkania od klientów.</p>
        </div>
      </div>

      <div className={styles.pageContent}>
        <section className={styles.calendarSection}>
          <div className={styles.calendarHeader}>
            <div>
              <h2 className={styles.monthLabel}>{monthLabel}</h2>
            </div>
            <div className={styles.calendarControls}>
              <Button className={styles.calendarControl} type="button" style="secondary" onClick={() => changeMonth(-1)}>
                Poprzedni
              </Button>
              <Button className={styles.calendarControl} type="button" style="secondary" onClick={() => setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1))}>
                Dziś
              </Button>
              <Button className={styles.calendarControl} type="button" style="secondary" onClick={() => changeMonth(1)}>
                Następny
              </Button>
            </div>
          </div>

          <div className={styles.calendarGrid}>
            {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'].map((day) => (
              <div key={day} className={styles.dayName}>
                {day}
              </div>
            ))}

            {monthMatrix.map((date) => {
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
              const isToday = isSameDay(date, today);
              const events = eventsByDay.get(date.toDateString()) || [];

              return (
                <div
                  key={date.toISOString()}
                  className={`${styles.dayCell} ${isCurrentMonth ? '' : styles.otherMonth} ${isToday ? styles.todayCell : ''
                    }`}
                >
                  <div className={styles.dayNumber}>{date.getDate()}</div>
                  <div className={styles.eventList}>
                    {events.slice(0, 3).map((event) => {
                      // Bezpieczne wyciągnięcie imienia i nazwiska klienta
                      const clientName = event.relation.client
                        ? `${event.relation.client.firstName} ${event.relation.client.lastName}`
                        : 'Brak przypisanego klienta';

                      return (
                        <div key={event.id} className={styles.eventItem}>
                          <span className={styles.eventTime}>{formatTime(event.startAt)}</span>
                          <span className={styles.eventTitle}>{event.title}</span>

                          {/* NOWOŚĆ: Chmurka z informacją, która pojawi się po najechaniu */}
                          <div className={styles.eventTooltip}>
                            <div className={styles.tooltipHeader}>{event.title}</div>
                            <div className={styles.tooltipBody}>
                              <p><span>Klient:</span> {clientName}</p>
                              {event.relation.client?.email && (
                                <p><span>Email:</span> {event.relation.client.email}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {events.length > 3 && (
                      <div className={styles.moreEvents}>+{events.length - 3} więcej</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {loading && <div className={styles.loader}>Ładowanie kalendarza...</div>}
          {error && <div className={styles.errorMessage}>{error}</div>}
        </section>

        <aside className={styles.sidebarSection}>
          <div className={styles.sidebarHeader}>
            <h3>Do akceptacji</h3>
            <p>Spotkania oczekujące na decyzję.</p>
          </div>

          {pendingEntries.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Brak oczekujących spotkań.</p>
            </div>
          ) : (
            <div className={styles.pendingList}>
              {pendingEntries.map((entry) => {
                const clientName = entry.relation.client
                  ? `${entry.relation.client.firstName} ${entry.relation.client.lastName}`
                  : 'Klient';
                return (
                  <div key={entry.id} className={styles.pendingCard}>
                    <div className={styles.pendingMeta}>
                      <span className={styles.pendingTitle}>{entry.title}</span>
                      <span className={styles.pendingClient}>{clientName}</span>
                    </div>
                    <div className={styles.pendingInfo}>
                      <span>{new Date(entry.startAt).toLocaleDateString('pl-PL')}</span>
                      <span>{formatTime(entry.startAt)} - {formatTime(entry.endAt)}</span>
                    </div>
                    <div className={styles.pendingActions}>
                      <Button
                        type="button"
                        style="primary"
                        disabled={actionLoading === entry.id}
                        onClick={() => handleStatusChange(entry.id, 'CONFIRMED')}
                      >
                        Akceptuj
                      </Button>
                      <Button
                        type="button"
                        style="secondary"
                        disabled={actionLoading === entry.id}
                        onClick={() => handleStatusChange(entry.id, 'REJECTED')}
                      >
                        Odrzuć
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default CalendarPage;
