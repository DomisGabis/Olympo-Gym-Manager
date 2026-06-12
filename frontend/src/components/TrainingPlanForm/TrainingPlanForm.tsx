import React, { useState, useEffect, type FormEvent } from 'react';
import styles from './TrainingPlanForm.module.css';
import { apiClient } from '../../services/apiClient';
import type { TrainingPlan, TrainingPlanEntry } from '../../types/trainingPlan.types';
import type { Exercise } from '../../types/exercise.type';
import Button from '../Button/Button';

// 1. Definicja interfejsów na podstawie bazy danych ze screena


// Słownik dla listy rozwijanej ćwiczeń

interface TrainingPlanFormProps {
  existingPlan: TrainingPlan | null;
  onSubmit: () => void;
  onCancel?: () => void;
  clientId: string;
}

// Stałe dni tygodnia pasujące do enuma w bazie danych
const DAYS_OF_WEEK = [
  { value: 'MONDAY', label: 'Poniedziałek' },
  { value: 'TUESDAY', label: 'Wtorek' },
  { value: 'WEDNESDAY', label: 'Środa' },
  { value: 'THURSDAY', label: 'Czwartek' },
  { value: 'FRIDAY', label: 'Piątek' },
  { value: 'SATURDAY', label: 'Sobota' },
  { value: 'SUNDAY', label: 'Niedziela' },
];

export function TrainingPlanForm({ existingPlan, onSubmit, onCancel, clientId }: TrainingPlanFormProps) {
  const [name, setName] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [entries, setEntries] = useState<TrainingPlanEntry[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = existingPlan !== null;

  // Pobranie listy ćwiczeń do selectów oraz inicjalizacja danych formularza
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await apiClient.get('/exercises');
        if (response.data.success) {
          setExercises(response.data.data);
        }
      } catch (err) {
        console.error('Błąd podczas pobierania ćwiczeń:', err);
      }
    };

    fetchExercises();

    if (existingPlan) {
      setName(existingPlan.name || existingPlan.title || '');
      setStartDate(
        existingPlan.startDate ? new Date(existingPlan.startDate).toISOString().slice(0, 10) : ''
      );
      setEndDate(
        existingPlan.endDate ? new Date(existingPlan.endDate).toISOString().slice(0, 10) : ''
      );
      setEntries(existingPlan.entries);
    } else {
      setName('');
      setStartDate('');
      setEndDate('');
      setEntries([]); // Zaczynamy z pustą listą wpisów
    }
  }, [existingPlan]);

  // Dodawanie nowego, czystego wpisu do planu
  const handleAddEntry = () => {
    const newEntry: TrainingPlanEntry = {
      exerciseId: '',
      dayOfWeek: 'MONDAY',
      setsCount: 3,
      repsRange: '8-12',
      weight: null,
      isCompleted: false,
    };
    setEntries((prev) => [...prev, newEntry]);
  };

  // Usuwanie wpisu o danym indeksie
  const handleRemoveEntry = (indexToRemove: number) => {
    setEntries((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Aktualizacja konkretnego pola w konkretnym wpisie
  const handleEntryChange = (index: number, field: keyof TrainingPlanEntry, value: any) => {
    setEntries((prev) =>
      prev.map((entry, idx) => {
        if (idx === index) {
          return { ...entry, [field]: value };
        }
        return entry;
      })
    );
  };

  // Submit formularza
  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nazwa planu treningowego jest wymagana.');
      return;
    }
    if (entries.length === 0) {
      setError('Plan treningowy musi zawierać co najmniej jedno ćwiczenie.');
      return;
    }
    // Walidacja czy wybrano ćwiczenia
    if (!startDate || !endDate) {
      setError('Należy wybrać datę rozpoczęcia i zakończenia planu.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Data rozpoczęcia nie może być późniejsza niż data zakończenia.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const payload = {
        title: name.trim(),
        startDate,
        endDate,
        entries,
      };

      if (existingPlan && existingPlan.id) {
        await apiClient.patch(`/training-plans/${existingPlan.id}`, payload);
      } else {
        await apiClient.post('/training-plans', {
          clientId,
          ...payload,
        });
      }

      onSubmit();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Wystąpił błąd podczas zapisywania planu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>
        {isEditMode ? 'Edycja Planu Treningowego' : 'Nowy Plan Treningowy'}
      </h2>

      {error && <div className={styles.errorAlert}>✕ {error}</div>}

      <form onSubmit={handleFormSubmit} className={styles.mainForm}>
        {/* Sekcja: Podstawowe informacje */}
        <div className={styles.inputGroup}>
          <label htmlFor="planName">Nazwa Planu</label>
          <input
            id="planName"
            type="text"
            placeholder="np. Push/Pull A, Trening redukcyjny"
            className={styles.textInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.dateInputsRow}>
          <div className={styles.inputGroup}>
            <label htmlFor="startDate">Data rozpoczęcia</label>
            <input
              id="startDate"
              type="date"
              className={styles.textInput}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="endDate">Data zakończenia</label>
            <input
              id="endDate"
              type="date"
              className={styles.textInput}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Sekcja: Wpisy ćwiczeń (Entries) */}
        <div className={styles.entriesSection}>
          <div className={styles.entriesHeader}>
            <h3 className={styles.entriesTitle}>Ćwiczenia w planie ({entries.length})</h3>
            <Button
              style='secondary'
              onClick={handleAddEntry}
              disabled={isSubmitting}
            >
              Dodaj ćwiczenie
            </Button>
          </div>

          {entries.length === 0 ? (
            <div className={styles.emptyEntriesPlaceholder}>
              Brak dodanych ćwiczeń. Kliknij przycisk powyżej, aby dodać pierwsze pozycje do planu treningowego.
            </div>
          ) : (
            <div className={styles.entriesList}>
              {entries.map((entry, index) => (
                <div key={index} className={styles.entryCard}>
                  
                  {/* Górny pasek wpisu z numerkiem i przyciskiem usuwania */}
                  <div className={styles.entryCardHeader}>
                    <span>Pozycja #{index + 1}</span>
                    <button
                      type="button"
                      className={styles.removeEntryBtn}
                      onClick={() => handleRemoveEntry(index)}
                      disabled={isSubmitting}
                    >
                      Usuń
                    </button>
                  </div>

                  {/* Grid z polami pojedynczego wpisu */}
                  <div className={styles.entryGrid}>
                    
                    {/* Wybór ćwiczenia (exerciseId) */}
                    <div className={styles.subInputGroup}>
                      <label>Ćwiczenie</label>
                      <select
                        value={entry.exerciseId}
                        required
                        className={styles.selectInput}
                        onChange={(e) => handleEntryChange(index, 'exerciseId', e.target.value)}
                        disabled={isSubmitting}
                      >
                        <option value="">-- Wybierz --</option>
                        {exercises.map((ex) => (
                          <option key={ex.id} value={ex.id}>
                            {ex.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Dzień tygodnia (dayOfWeek) */}
                    <div className={styles.subInputGroup}>
                      <label>Dzień tygodnia</label>
                      <select
                        value={entry.dayOfWeek}
                        className={styles.selectInput}
                        onChange={(e) => handleEntryChange(index, 'dayOfWeek', e.target.value)}
                        disabled={isSubmitting}
                      >
                        {DAYS_OF_WEEK.map((day) => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Liczba serii (setsCount - Int) */}
                    <div className={styles.subInputGroup}>
                      <label>Liczba serii</label>
                      <input
                        type="number"
                        min={1}
                        className={styles.textInput}
                        value={entry.setsCount}
                        onChange={(e) => handleEntryChange(index, 'setsCount', parseInt(e.target.value) || 0)}
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Zakres powtórzeń (repsRange - String) */}
                    <div className={styles.subInputGroup}>
                      <label>Powtórzenia</label>
                      <input
                        type="text"
                        placeholder="np. 8-12 lub 5"
                        className={styles.textInput}
                        value={entry.repsRange}
                        onChange={(e) => handleEntryChange(index, 'repsRange', e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Ciężar (weight - Float?) */}
                    <div className={styles.subInputGroup}>
                      <label>Ciężar (kg, opcjonalnie)</label>
                      <input
                        type="number"
                        step="0.25"
                        min={0}
                        placeholder="Zostaw puste"
                        className={styles.textInput}
                        value={entry.weight !== null ? entry.weight : ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleEntryChange(index, 'weight', val === '' ? null : parseFloat(val));
                        }}
                        disabled={isSubmitting}
                      />
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dolne przyciski akcji formularza */}
        <div className={styles.formActions}>
          <Button
            type="submit"
            style='primary'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Zapisywanie planu...' : 'Zapisz zmiany'}
          </Button>
          {onCancel && (
            <Button
              type="button"
              style='secondary'
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Anuluj
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}