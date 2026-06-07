import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import ProfileDataSection from './ProfileDataSection';
import styles from './ProfilePage.module.css'
import Button from '../../../components/Button/Button';
import Modal from '../../../components/Modal/Modal';
import { apiClient } from '../../../services/apiClient';

function ProfilePage() {
    const { user, checkAuthStatus } = useAuth();
    const registrationDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pl-PL') : '';
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeField, setActiveField] = useState<{ id: string; type: string; title: string; value: string } | null>(null);
    const [newValue, setNewValue] = useState('');

    if (!user) {
        return <div className={styles.container}>Ładowanie...</div>
    }
    const handleOpenEdit = (fieldId: string, type: string, fieldTitle: string, currentValue: string) => {
        setActiveField({ id: fieldId, type: type, title: fieldTitle, value: currentValue });
        setNewValue(currentValue);
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeField) return;
        try {
            const response = await apiClient.patch('/users/profile', { [activeField.id]: newValue });

            if (response.data.success) {
                const updatedUser = response.data.data; 
                checkAuthStatus();
            }
            setIsModalOpen(false);
            setActiveField(null);
        } catch (err) {
            console.error("Błąd zapisu:", err);
        }
        setIsModalOpen(false);
        setActiveField(null);
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className='pageTitle'>Profil użytkownika</h1>
                <div className={styles.profileData}>
                    <ProfileDataSection title="Imię" onEdit={() => handleOpenEdit('firstName', 'text', 'Imię', user.firstName)}>
                        {user.firstName}
                    </ProfileDataSection>
                    <ProfileDataSection title="Nazwisko" onEdit={() => handleOpenEdit('lastName', 'text', 'Nazwisko', user.lastName)}>
                        {user.lastName}
                    </ProfileDataSection>
                    <ProfileDataSection title="Email" onEdit={() => handleOpenEdit('email', 'email', 'Email', user.email)}>
                        {user.email}
                    </ProfileDataSection>
                    <ProfileDataSection title="Hasło" onEdit={() => handleOpenEdit('password', 'password', 'Hasło', '')}>
                        ********
                    </ProfileDataSection>
                    <ProfileDataSection title="Rola">
                        {user.role}
                    </ProfileDataSection>
                    <ProfileDataSection title="Data dołączenia">
                        {registrationDate}
                    </ProfileDataSection>
                </div>

            </div>
            {isModalOpen && activeField && (
                <Modal onClose={() => setIsModalOpen(false)}>
                    <div>
                        <h2 className={styles.modalTitle}>Edytuj: {activeField.title}</h2>

                        <form onSubmit={handleSave} className={styles.form}>
                            <div className={styles.formSection}>
                                <label className={styles.label}>Nowa wartość</label>
                                <input
                                    type={activeField.type}
                                    className={styles.input}
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className={styles.modalButtons}>
                                <Button type="submit" style="primary">Zapisz</Button>
                                <Button type="button" style="secondary" onClick={() => setIsModalOpen(false)}>Anuluj</Button>
                            </div>
                        </form>
                    </div>
                </Modal>
            )}
        </div>
    )
}

export default ProfilePage