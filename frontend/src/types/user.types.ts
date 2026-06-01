export type UserRole = 'ADMIN' | 'TRAINER' | 'RECEPTIONIST' | 'CLIENT';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export type CreateUserData = Omit<User, 'id' | 'createdAt'>;