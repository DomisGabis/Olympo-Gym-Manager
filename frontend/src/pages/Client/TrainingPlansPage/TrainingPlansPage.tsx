import Button from '../../../components/Button/Button';
import styles from './TrainingPlansPage.module.css';

function TrainingPlansPage() {
    return (
        <div className={styles.container}>
            <h1>Plany treningowe</h1>
            <div className={styles.contentHeader}>
                <p className={styles.planCount}>Liczba planów: 0</p>
                <Button style="primary" className={styles.addButton}>
                    Dodaj plan
                </Button>
            </div>
            <p>Ta strona jest w trakcie tworzenia. Wkrótce pojawią się tutaj Twoje plany treningowe!</p>
        </div>
    );
}

export default TrainingPlansPage;