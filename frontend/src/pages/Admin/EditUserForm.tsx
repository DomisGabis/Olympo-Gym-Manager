import { useState, type FormEvent } from 'react';
import type { User, UserRole } from '../../types/user.types'
import styles from './EditUserForm.module.css'
import { apiClient } from '../../services/apiClient';
import Button from '../../components/Button/Button';

interface Props {
    user: User
    includeHeader?: boolean;
    onSave: () => void;
}

function EditUserForm({ user, includeHeader, onSave }: Props) {
    const id = user.id;
    const createdAt = user.createdAt;
    const [firstName, setFirstName] = useState<string>(user.firstName);
    const [lastName, setLastName] = useState<string>(user.lastName);
    const [email, setEmail] = useState<string>(user.email);
    const [role, setRole] = useState<UserRole>(user.role);
    const [password, setPassword] = useState<string>('');

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const updateData: any = {
                firstName,
                lastName,
                email,
                role
            };
            if (password.trim()) {
                updateData.password = password;
            }
            // console.log(updateData);

            const response = await apiClient.patch(`/users/${user.id}`, updateData);
            // console.log(response.data);

            if (response.data.success) {
                onSave();
            } else {
                setError(response.data.message || 'Wystąpił błąd podczas zapisu.');
            }
        } catch (err: any) {
            console.error('Błąd edycji użytkownika:', err);
            setError(err.response?.data?.message || 'Nie udało się zapisać zmian.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {includeHeader ?
                <div className={styles.header}>
                    <h1 className='pageTitle'>
                        Edycja Użytkownika
                    </h1>
                </div>
                : <></>}
            <form onSubmit={handleSubmit} className={styles.content}>
                {error && <div className={styles.errorMessage}>{error}</div>}

                <div className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="firstName">Imię</label>
                        <input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            placeholder="Imię"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="lastName">Nazwisko</label>
                        <input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            placeholder="Nazwisko"
                        />
                    </div>
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="email">Adres E-mail</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="client@olympo.com"
                    />
                </div>

                

                <div className={styles.inputGroup}>
                    <label htmlFor="password">
                        Nowe Hasło <span className={styles.optionalHint}>(opcjonalnie)</span>
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Pozostaw puste, aby nie zmieniać"
                    />
                </div>
                    <Button 
                        type="submit" 
                        style="primary" 
                        disabled={loading}
                        className={styles.submitBtn}
                    >
                        {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
                    </Button>
            </form>
        </div>
    )
}

export default EditUserForm;