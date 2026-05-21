import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import passport from './modules/auth/passport';
import authRouter from './modules/auth/auth.routes';
import usersRouter from './modules/users/users.routes';          // NOWOŚĆ
import membershipsRouter from './modules/memberships/memberships.routes'; // NOWOŚĆ

const app: Application = express();

// Middlewares globalne
app.use(cors());
app.use(express.json());

// Inicjalizacja Passport.js
app.use(passport.initialize());

// Podpięcie tras modułowych
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);               // NOWOŚĆ: prefiks /api/users
app.use('/api/memberships', membershipsRouter);   // NOWOŚĆ: prefiks /api/memberships

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Olympo API works fine!' });
});

// Globalny Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('💥 Global Error Caught:', err.message);
  res.status(500).json({ success: false, message: 'Wewnętrzny błąd serwera.' });
});

export default app;