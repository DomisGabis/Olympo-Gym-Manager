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
  
  // POPRAWKA 1: Jeśli nie ma tokenu, przerywamy funkcję NATYCHMIAST.
  // Nie wysyłamy żądania na backend, dzięki czemu unikamy niepotrzebnego błędu 401.
  if (!token) {
    setUser(null);
    setIsLoading(false);
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/users/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, //
        'Content-Type': 'application/json'
      }
    });

    // POPRAWKA 2: Sprawdzamy, czy odpowiedź to na pewno JSON (czy status jest OK)
    // zanim bezwarunkowo wywołamy .json()
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        setUser(result.data); 
      } else {
        logout();
      }
    } else {
      // Jeśli serwer zwrócił np. 401 "Unauthorized" w formie tekstu:
      console.warn("Sesja wygasła lub token jest niepoprawny.");
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
  localStorage.removeItem('user');
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