import styles from './ExerciseForm.module.css';
import { useState, type FormEvent } from 'react';
import { apiClient } from '../../services/apiClient';
import Button from '../../components/Button/Button';
import type { Exercise, ExerciseCategory, ExerciseDifficultyLevel, MusclePart } from '../../types/exercise.type';

interface Props {
  exercise?: Exercise;
  formHeader?: string;
  onSubmit: () => void;
}

// Stała lista partii mięśniowych bazująca na danych z bazy systemu
const AVAILABLE_MUSCLES: MusclePart[] = [
  'Czworogłowy ud',
  'Triceps', 
  'Biceps'
];

function ExerciseForm({ exercise, formHeader, onSubmit }: Props) {
  // Bezpieczna inicjalizacja stanów (zastąpienie null pustymi wartościami dla komponentów kontrolowanych)
  const [name, setName] = useState<string>(exercise?.name || '');
  const [category, setCategory] = useState<ExerciseCategory>(exercise?.category || 'Nogi');
  const [muscleParts, setMuscleParts] = useState<MusclePart[]>(exercise?.muscleParts || []);
  const [level, setLevel] = useState<ExerciseDifficultyLevel>(exercise?.level || 'Średni');
  const [videoUrl, setVideoUrl] = useState<string>(exercise?.videoUrl || '');
  const [description, setDescription] = useState<string>(exercise?.description || '');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!exercise?.id;

  const handleCheckboxChange = (muscle: MusclePart) => {
    setMuscleParts((prevSelected) => {
      if (prevSelected.includes(muscle)) {
        return prevSelected.filter((item) => item !== muscle);
      }
      return [...prevSelected, muscle];
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Przygotowanie body żądania (opcjonalne pola wysyłamy jako null lub undefined jeśli są puste)
    const payload = {
      name,
      category,
      muscleParts,
      level,
      videoUrl: videoUrl.trim() || undefined,
      description: description.trim() || undefined,
    };

    try {
      let response;
      if (isEditMode) {
        // Tryb Edycji
        response = await apiClient.put(`/exercises/${exercise.id}`, payload);
      } else {
        // Tryb Tworzenia
        response = await apiClient.post('/exercises', payload);
      }

      if (response.data.success) {
        onSubmit(); // Wywołanie callbacku (zamknięcie modalu i odświeżenie listy)
      } else {
        setError(response.data.message || 'Wystąpił błąd podczas zapisywania ćwiczenia.');
      }
    } catch (err: any) {
      console.error('Błąd formularza ćwiczenia:', err);
      setError(err.response?.data?.message || 'Błąd połączenia z serwerem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {formHeader && (
        <div className={styles.header}>
          <h1 className="pageTitle">{formHeader}</h1>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.content}>
        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.formGrid}>
          {/* Rząd 1 */}
          <div className={styles.inputGroup}>
            <label htmlFor="name">Nazwa ćwiczenia</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="np. Przysiad"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="category">Kategoria</label>
            <select
              id="category"
              className={styles.selectInput}
              value={category}
              onChange={(e) => setCategory(e.target.value as ExerciseCategory)}
            >
              <option value="Nogi">Nogi</option>
              <option value="Klatka piersiowa">Klatka piersiowa</option>
              <option value="Plecy">Plecy</option>
              <option value="Barki">Barki</option>
              <option value="Brzuch">Brzuch</option>
            </select>
          </div>

          {/* Rząd 2 */}
          <div className={styles.inputGroup}>
            <label htmlFor="level">Poziom trudności</label>
            <select
              id="level"
              className={styles.selectInput}
              value={level}
              onChange={(e) => setLevel(e.target.value as ExerciseDifficultyLevel)}
            >
              <option value="Niski">Niski</option>
              <option value="Średni">Średni</option>
              <option value="Wysoki">Wysoki</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="videoUrl">
              Link do wideo <span className={styles.optionalHint}>(opcjonalnie)</span>
            </label>
            <input
              id="videoUrl"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/..."
            />
          </div>
        </div>

        {/* Sekcja wielokrotnego wyboru partii mięśniowych (pełna szerokość) */}
        <div className={styles.inputGroup}>
          <label>Zaangażowane partie mięśniowe</label>
          <div className={styles.tagsGrid}>
            {AVAILABLE_MUSCLES.map((muscle) => {
              const isSelected = muscleParts.includes(muscle);
              return (
                <button
                  key={muscle}
                  type="button"
                  className={`${styles.tagButton} ${isSelected ? styles.activeTag : ''}`}
                  onClick={() => handleCheckboxChange(muscle)}
                >
                  {muscle} {isSelected && '✓'}
                </button>
              );
            })}
          </div>
          <span className={styles.selectedCountHint}>
            Wybrane: {muscleParts.length > 0 ? muscleParts.join(', ') : 'Brak'}
          </span>
        </div>

        {/* Opis wykonania (pełna szerokość na samym dole) */}
        <div className={styles.inputGroup}>
          <label htmlFor="description">
            Opis wykonania <span className={styles.optionalHint}>(opcjonalnie)</span>
          </label>
          <textarea
            id="description"
            className={styles.textareaInput}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Opisz prawidłową technikę, pozycję startową oraz najczęstsze błędy..."
          />
        </div>

        <Button
          type="submit"
          style="primary"
          disabled={loading}
          className={styles.submitBtn}
        >
          {loading ? 'Zapisywanie...' : isEditMode ? 'Zapisz zmiany' : 'Dodaj ćwiczenie'}
        </Button>
      </form>
    </div>
  );
}

export default ExerciseForm;