import styles from './RegisterPage.module.css';
import logo from "/olympo-logo.png";
import RegisterForm from './RegisterForm';

function RegisterPage() {
  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <img src={logo} className={styles.logo} />
        <h1 className={styles.title}>Olympo</h1>
        <RegisterForm loginButton />
      </div>
    </div>
  );
}

export default RegisterPage;