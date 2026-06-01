import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProfileDataSection from './ProfileDataSection';
import styles from './ProfilePage.module.css'
import Button from '../../components/Button/Button';

function ProfilePage() {
    const [user, setUser] = useState(useAuth().user);
    if (!user) {
        return <div className={styles.container}>Ładowanie...</div>
    }
    const registrationDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pl-PL') : '';
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeField, setActiveField] = useState<{ id: string; title: string; value: string } | null>(null);
    const [newValue, setNewValue] = useState('');

    const handleOpenEdit = (fieldId: string, fieldTitle: string, currentValue: string) => {
        setActiveField({ id: fieldId, title: fieldTitle, value: currentValue });
        setNewValue(currentValue);
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeField) return;
        try {
            // const response = await apiClient.patch('/users/profile', { [activeField.id]: newValue });

            // Jeśli Twój AuthContext posiada metodę aktualizacji, np. updateUserData(newData)
            // lub po prostu aktualizujesz stan lokalny / ponownie wywołujesz login(token, updatedUser):
            // login(aktualnyToken, updatedUser);
            setIsModalOpen(false);
            setActiveField(null);
        } catch (err) {
            console.error("Błąd zapisu:", err);
        }
        setIsModalOpen(false);
        setActiveField(null);
    };

    return (
        <>
            <div className={styles.container}>
                <h1>Profil użytkownika</h1>
                <div className={styles.profileData}>
                    <ProfileDataSection title="Imię" onEdit={() => handleOpenEdit('firstName', 'Imię', user.firstName)}>
                        {user.firstName}
                    </ProfileDataSection>
                    <ProfileDataSection title="Nazwisko" onEdit={() => handleOpenEdit('lastName', 'Nazwisko', user.lastName)}>
                        {user.lastName}
                    </ProfileDataSection>
                    <ProfileDataSection title="Email" onEdit={() => handleOpenEdit('email', 'Email', user.email)}>
                        {user.email}
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
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>Edytuj: {activeField.title}</h2>

                        <form onSubmit={handleSave} className={styles.form}>
                            <div className={styles.formSection}>
                                <label className={styles.label}>Nowa wartość</label>
                                <input
                                    type="text"
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
                </div>
            )}</>)
}

export default ProfilePage