import React, { useState, useEffect } from 'react';
import styles from './ExerciseDatabasePage.module.css';
import Button from '../../../components/Button/Button';
import { apiClient } from '../../../services/apiClient';
import type { Exercise } from '../../../types/exercise.type';
import type { PaginationMeta } from '../../../types/common.types';
import Modal from '../../../components/Modal/Modal';
import ConfirmationWindow from '../../../components/ConfirmationWindow/ConfirmationWindow';
import ExerciseForm from './ExerciseForm'
import { useAuth } from '../../../context/AuthContext';

interface ExerciseCounts {
  overall: number;
  byCategory: {
    NOGI: number;
    KLATKA: number;
    PLECY: number;
    BARKI: number;
  };
}

function ExerciseDatabasePage() {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ totalItems: 0, totalPages: 1, currentPage: 1, limit: 10 });

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const [addingExercise, setAddingExercise] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [deletingExercise, setDeletingExercise] = useState<Exercise | null>(null);

  const fetchExercises = async () => {
    try {
      let url = `/exercises?page=${currentPage}&limit=10`;
      if (selectedCategory !== 'ALL') url += `&category=${selectedCategory}`;
      if (search) url += `&search=${search}`;

      const response = await apiClient.get(url);
      console.log(response);
      if (response.data.success) {
        setExercises(response.data.data);
        setMeta(response.data.meta);
      }
    } catch (error) {
      console.error('Błąd pobierania bazy ćwiczeń:', error);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [currentPage, selectedCategory, search]);

  const handleExerciseCreated = () => {
    setAddingExercise(false);
    fetchExercises();
  };

  const handleExerciseUpdated = () => {
    setEditingExercise(null);
    fetchExercises();
  };

  const handleExerciseDeleted = async () => {
    if (!deletingExercise) return;
    try {
      const response = await apiClient.delete(`/exercises/${deletingExercise.id}`);
      if (response.data.success) {
        setDeletingExercise(null);
        fetchExercises();
      }
    } catch (error) {
      console.error('Błąd podczas usuwania ćwiczenia:', error);
    }
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedExercises = [...exercises].sort((a, b) => {
    let valA = a[sortBy as keyof Exercise] ?? '';
    let valB = b[sortBy as keyof Exercise] ?? '';

    if (typeof valA === 'string') {
      return sortOrder === 'asc' ? valA.localeCompare(valB as string) : (valB as string).localeCompare(valA);
    }
    return 0;
  });

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.headerSection}>
        <div>
          <h1 className="pageTitle">Baza Ćwiczeń</h1>
          <p className="pageSubtitle">Zarządzaj atlasem ćwiczeń, materiałami wideo i poziomami trudności</p>
        </div>
        <Button className={styles.addBtn} style="primary" onClick={() => setAddingExercise(true)}>
          Dodaj ćwiczenie
        </Button>
      </div>

      <div className={styles.filterBar}>
        <input
          type="text"
          placeholder="Szukaj po nazwie lub opisie ćwiczenia..."
          className={styles.searchInput}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
        />
        <div className={styles.selectsGroup}>
          <div className={styles.selectContainer}>
            {/* <label htmlFor="categoryFilter" className={styles.selectLabel}>Kategoria</label> */}
            <select
              id="categoryFilter"
              className={styles.selectInput}
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1); // KLUCZOWE: Resetujemy stronę do 1 przy zmianie filtra!
              }}
            >
              {/* Opcja neutralna - resetująca filtr */}
              <option value="ALL">Wszystkie kategorie</option>

              {/* Opcje szczegółowe */}
              <option value="Nogi">Nogi</option>
              <option value="Klatka piersiowa">Klatka piersiowa</option>
              <option value="Plecy">Plecy</option>
              <option value="Barki">Brzuch</option>
            </select>
          </div>

        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.exerciseTable}>
          <thead>
            <tr>
              <th className={styles.colName} onClick={() => toggleSort('name')}>
                Nazwa ćwiczenia {sortBy === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th className={styles.colCategory} onClick={() => toggleSort('category')}>
                Kategoria {sortBy === 'category' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th className={styles.colLevel} onClick={() => toggleSort('level')}>
                Poziom {sortBy === 'level' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th className={styles.colActions} style={{ textAlign: 'right' }}>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {sortedExercises.map((exercise) => (
              <tr key={exercise.id}>
                <td>
                  <div className={styles.exerciseInfo}>
                    <span className={styles.exerciseName}>{exercise.name}</span>
                    {exercise.description && <span className={styles.exerciseDesc}>{exercise.description}</span>}
                  </div>
                </td>
                <td>
                  <span className={`${styles.categoryBadge} ${styles[exercise.category.toLowerCase()]}`}>
                    {exercise.category}
                  </span>
                </td>
                <td>
                  <span className={`${styles.levelBadge} ${styles[exercise.level.toLowerCase()]}`}>
                    {exercise.level}
                  </span>
                </td>
                <td>
                  <div className={styles.actionGroup}>
                    <button className={styles.actionBtn} title="Edytuj" onClick={() => setEditingExercise(exercise)}>
                      ✎
                    </button>
                    {
                      user?.role === 'ADMIN' &&
                      <button className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Usuń" onClick={() => setDeletingExercise(exercise)}>
                        🗑
                      </button>
                    }
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* IDENTYCZNA PAGINACJA ODZWIERCIEDLAJĄCA MANAGEUSERS */}
        <div className={styles.paginationBar}>
          <span className={styles.paginationInfo}>
            Łącznie: <strong>{meta?.totalItems}</strong> ćwiczeń
          </span>
          <div className={styles.paginationControls}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className={styles.pageBtn}
            >
              ◀
            </button>
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`${styles.pageBtn} ${currentPage === page ? styles.activePage : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              disabled={currentPage === meta.totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, meta.totalPages))}
              className={styles.pageBtn}
            >
              ▶
            </button>
          </div>
        </div>
      </div>

      {addingExercise && (
        <Modal onClose={() => setAddingExercise(false)}>
          <ExerciseForm formHeader='Dodawanie ćwiczenia' onSubmit={handleExerciseCreated} />
        </Modal>
      )}

      {editingExercise && (
        <Modal onClose={() => setEditingExercise(null)}>
          <ExerciseForm formHeader='Edycja ćwiczenia' exercise={editingExercise} onSubmit={handleExerciseUpdated} />
        </Modal>
      )}

      {deletingExercise && (
        <Modal onClose={() => setDeletingExercise(null)}>
          <ConfirmationWindow
            onConfirm={handleExerciseDeleted}
            onClose={() => setDeletingExercise(null)}
          >
            Czy na pewno chcesz usunąć ćwiczenie: <strong>{deletingExercise.name}</strong>? Tej akcji nie można cofnąć.
          </ConfirmationWindow>
        </Modal>
      )}
    </div>
  );
}

export default ExerciseDatabasePage;