import React, { useState, useEffect } from 'react';
import styles from './TrainersPage.module.css';
import Button from '../../../components/Button/Button';
import { apiClient } from '../../../services/apiClient';
import type { PaginationMeta } from '../../../types/common.types';
import { Navigate } from 'react-router-dom';

interface Trainer {
    id: string;
    firstName: string;
    lastName: string;
    isMyTrainer: boolean;
}

function TrainersPage() {
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [meta, setMeta] = useState<PaginationMeta>({ totalItems: 0, totalPages: 1, currentPage: 1, limit: 6 });
    const [loading, setLoading] = useState<boolean>(false);

    const [search, setSearch] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState<string>('ALL');
    const [currentPage, setCurrentPage] = useState(1);

    const fetchTrainers = async () => {
        setLoading(true);
        try {
            let url = `/users/trainers?page=${currentPage}&limit=6`;
            if (search) url += `&search=${search}`;

            const response = await apiClient.get(url);
            if (response.data.success) {
                setTrainers(response.data.data);
                setMeta(response.data.meta);
            }
        } catch (error) {
            console.error('Błąd pobierania listy trenerów:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrainers();
    }, [currentPage, selectedSpecialty, search]);

    const myTrainers = trainers.filter(t => t.isMyTrainer);
    const otherTrainers = trainers.filter(t => !t.isMyTrainer);

    const renderTrainerCard = (trainer: Trainer) => (
        <div key={trainer.id} className={styles.trainerCard}>
            <div className={styles.cardMainContent}>
                {/* <div
                    className={styles.avatar}
                    style={{ backgroundColor: trainer.avatarColor || '#1e75ff' }}
                >
                    {getInitials(trainer.firstName, trainer.lastName)}
                </div> */}
                <div className={styles.trainerInfo}>
                    <h3 className={styles.trainerName}>{trainer.firstName} {trainer.lastName}</h3>
                </div>
            </div>

            {/* <div className={styles.statsRow}>
        <span className={styles.rating}>★ {trainer.rating.toFixed(1)}</span>
        <span className={styles.sessions}>{trainer.sessionsCount} sesji</span>
      </div> */}

            <Button
                style="secondary"
                className={styles.profileBtn}
                link={`/trainer/${trainer.id}`}
            >
                Zobacz profil
            </Button>
        </div>
    );

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.headerSection}>
                <div>
                    <h1 className="pageTitle">Trenerzy</h1>
                    <p className={styles.pageSubtitle}>Przeglądaj swoich trenerów i znajdź nowych</p>
                </div>
            </div>

            {/* Ciemny pasek wyszukiwania i filtrów */}
            <div className={styles.filterBar}>
                <input
                    type="text"
                    placeholder="Szukaj trenera..."
                    className={styles.searchInput}
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                />
                {/* <select 
          className={styles.selectInput}
          value={selectedSpecialty}
          onChange={(e) => { setSelectedSpecialty(e.target.value); setCurrentPage(1); }}
        >
          <option value="ALL">Wszystkie specjalizacje</option>
          <option value="Trening siłowy">Trening siłowy</option>
          <option value="Redukcja">Redukcja</option>
          <option value="CrossFit">CrossFit</option>
          <option value="Kondycja">Kondycja</option>
        </select> */}
            </div>


            <div className={styles.listsContainer}>
                <div className={styles.sectionBlock}>
                    <h2 className={styles.sectionTitle} data-type="my">Twoi trenerzy</h2>
                    {myTrainers.length ? (

                        <div className={styles.trainersGrid}>
                            {myTrainers.map(renderTrainerCard)}
                        </div>
                    ) : (
                        <p className={styles.noResults}>Nie znaleziono trenerów spełniających kryteria</p>
                    )}
                </div>
                <div className={styles.sectionBlock}>
                    <h2 className={styles.sectionTitle} data-type="others">Pozostali trenerzy</h2>
                    {otherTrainers.length ? (
                        <div className={styles.trainersGrid}>
                            {otherTrainers.map(renderTrainerCard)}
                        </div>
                    ) : (
                        <p className={styles.noResults}>Nie znaleziono trenerów spełniających kryteria</p>
                    )}
                </div>
            </div>


            {/* Paginacja w stylu Dark Mode */}
            {meta.totalPages > 1 && (
                <div className={styles.paginationBar}>
                    <span className={styles.paginationInfo}>
                        Łącznie: <strong>{meta.totalItems}</strong> dostępnych trenerów
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
            )}
        </div>
    );
}

export default TrainersPage;