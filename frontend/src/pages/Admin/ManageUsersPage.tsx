import React, { useState, useEffect } from 'react';
import styles from './ManageUsersPage.module.css';
import Button from '../../components/Button/Button';
import { apiClient } from '../../services/apiClient';
import type { User } from '../../types/user.types';
import type { PaginationMeta } from '../../types/common.types';

function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ totalItems: 0, totalPages: 1, currentPage: 1, limit: 10 });
  
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('lastName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const stats = {
    ADMIN: users.filter(u => u.role === 'ADMIN').length,
    TRAINER: users.filter(u => u.role === 'TRAINER').length,
    RECEPTIONIST: users.filter(u => u.role === 'RECEPTIONIST').length,
    CLIENT: users.filter(u => u.role === 'CLIENT').length,
  };

  const fetchUsers = async () => {
    try {
      let url = `/users?page=${currentPage}&limit=10`;
      if (selectedRole !== 'ALL') url += `&role=${selectedRole}`;
      if (search) url += `&search=${search}`;
      
      const response = await apiClient.get(url);
      if (response.data.success) {
        setUsers(response.data.data);
        setMeta(response.data.meta);
      }
    } catch (error) {
      console.error('Błąd pobierania użytkowników:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, selectedRole, search]);

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    let valA = a[sortBy as keyof User] ?? '';
    let valB = b[sortBy as keyof User] ?? '';
    
    if (typeof valA === 'string') {
      return sortOrder === 'asc' ? valA.localeCompare(valB as string) : (valB as string).localeCompare(valA);
    }
    return 0;
  });

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.headerSection}>
        <div>
          <h1 className='pageTitle'>Zarządzanie Rolami</h1>
          <p className={styles.subtitle}>Zarządzaj użytkownikami i ich uprawnieniami systemowymi</p>
        </div>
        <Button className={styles.addUserBtn} style="primary">+ Dodaj użytkownika</Button>
      </div>

      <div className={styles.statsGrid}>
        {[
          { label: 'Administrator', count: stats.ADMIN, role: 'ADMIN', color: '#dc3545' },
          { label: 'Trener', count: stats.TRAINER, role: 'TRAINER', color: '#007bff' },
          { label: 'Recepcja', count: stats.RECEPTIONIST, role: 'RECEPTIONIST', color: '#28a745' },
          { label: 'Klient', count: stats.CLIENT, role: 'CLIENT', color: '#a020f0' }
        ].map((card) => (
          <div 
            key={card.role} 
            className={`${styles.statCard} ${selectedRole === card.role ? styles.activeCard : ''}`}
            onClick={() => { setSelectedRole(selectedRole === card.role ? 'ALL' : card.role); setCurrentPage(1); }}
            style={{ '--accent-color': card.color } as React.CSSProperties}
          >
            <div className={styles.cardHeader}>
              <span className={styles.cardIndicator} />
              <span className={styles.cardLabel}>{card.label}</span>
            </div>
            <div className={styles.cardCount}>{card.count}</div>
            <span className={styles.cardSubText}>użytkowników</span>
          </div>
        ))}
      </div>

      <div className={styles.filterBar}>
        <input 
          type="text" 
          placeholder="Szukaj po imieniu, nazwisku lub emailu..." 
          className={styles.searchInput}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
        />
        {/* <select 
          className={styles.selectInput}
          value={selectedRole}
          onChange={(e) => { setSelectedRole(e.target.value); setCurrentPage(1); }}
        >
          <option value="ALL">Wszystkie role</option>
          <option value="ADMIN">Administrator</option>
          <option value="TRAINER">Trener</option>
          <option value="RECEPTIONIST">Recepcja</option>
          <option value="CLIENT">Klient</option>
        </select> */}
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.usersTable}>
          <thead>
            <tr>
              <th onClick={() => toggleSort('firstName')}>Użytkownik {sortBy === 'firstName' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
              <th onClick={() => toggleSort('email')}>Email {sortBy === 'email' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
              <th onClick={() => toggleSort('role')}>Rola {sortBy === 'role' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
              <th style={{ textAlign: 'right' }}>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className={styles.userIdentity}>
                    <div className={styles.avatar}>
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <span>{user.firstName} {user.lastName}</span>
                  </div>
                </td>
                <td className={styles.emailCell}>{user.email}</td>
                <td>
                  <span className={`${styles.roleBadge} ${styles[user.role.toLowerCase()]}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <div className={styles.actionGroup}>
                    <button className={styles.actionBtn} title="Edytuj">✎</button>
                    <button className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Usuń">🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Paginacja (Offset Pagination Controls) */}
        <div className={styles.paginationBar}>
          <span className={styles.paginationInfo}>
            Łącznie: <strong>{meta.totalItems}</strong> rekordów
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
    </div>
  );
}

export default ManageUsersPage;