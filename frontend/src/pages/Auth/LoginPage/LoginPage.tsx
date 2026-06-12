import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import logo from "/olympo-logo.png";
import { apiClient } from '../../../services/apiClient';
import styles from './LoginPage.module.css';
import Button from '../../../components/Button/Button';
import LoginForm from './LoginForm';

function LoginPage() {
    return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <img src={logo} className={styles.logo} />
        <h1 className={styles.title}>Olympo</h1>
        <LoginForm registerButton />
      </div>
    </div>
  );
}
export default LoginPage;