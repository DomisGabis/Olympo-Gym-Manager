import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import passport from './modules/auth/passport';
import authRouter from './modules/auth/auth.routes';
import usersRouter from './modules/users/users.routes';
import membershipRouter from './modules/memberships/memberships.routes';
import clubEntryRoutes from './modules/club-entry/club-entry.routes';
import trainingPlansRouter from './modules/training-plans/training-plans.routes';
import clientsRouter from './modules/clients/clients.routes';
import exercisesRouter from './modules/exercises/exercises.routes';
import calendarRouter from './modules/calendar/calendar.routes';
import messagesRouter from './modules/messages/messages.routes';
import qrCodesRoutes from './modules/qr-codes/qr-codes.routes';
import relationshipsRouter from './modules/relationships/relationships.routes';

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use(passport.initialize());

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/memberships', membershipRouter);
app.use('/api/club-entries', clubEntryRoutes);
app.use('/api/training-plans', trainingPlansRouter);
app.use('/api/exercises', exercisesRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/qr-codes', qrCodesRoutes);
app.use('/api/relationships', relationshipsRouter);

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Olympo API works fine!' });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('💥 Global Error Caught:', err.message);
  res.status(500).json({ success: false, message: 'Wewnętrzny błąd serwera.' });
});

export default app;