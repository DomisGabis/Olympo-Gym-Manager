import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'CLIENT' | 'TRAINER' | 'RECEPTIONIST' | 'ADMIN' | null;

interface User {
  id: number;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isLoading: boolean;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Funkcja weryfikująca token z backendem
  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      // Wywołujemy prawdziwy endpoint profilu z Twojego backendu
      const response = await fetch('http://localhost:3000/api/users/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Przekazujemy token w nagłówku
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Backend zwraca dane w obiekcie "data" zgodnie z meta-strukturą z README
        setUser(result.data); 
      } else {
        // Token wygasł lub jest niepoprawny
        logout();
      }
    } catch (error) {
      console.error("Błąd połączenia z backendem:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  // Sprawdź status logowania przy pierwszym uruchomieniu aplikacji
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};