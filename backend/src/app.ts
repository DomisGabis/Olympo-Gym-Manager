import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';

const app: Application = express();

// 1. Globalne Middlewares
app.use(cors()); // Zezwolenie na zapytania z frontendu (np. z Reacta działającego na innym porcie)
app.use(express.json()); // Parsowanie ciał żądań jako JSON (req.body)
app.use(express.urlencoded({ extended: true })); // Parsowanie danych z formularzy

// 2. Podstawowy endpoint testowy (Health Check)
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Olympo API działa poprawnie',
    timestamp: new Date().toISOString()
  });
});

// TODO: Tutaj w przyszłości wepniemy routery z modułów, np:
// app.use('/api/auth', authRouter);
// app.use('/api/training', trainingRouter);

// 3. Obsługa nieznanych ścieżek (404 Not Found)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    status: 'error',
    message: `Nie znaleziono ścieżki: ${req.originalUrl}`
  });
});

// 4. Globalny Error Handler (Łapacz błędów)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  console.error(`[BŁĄD]: ${err.message || err}`);
  
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Wewnętrzny błąd serwera',
    // W środowisku produkcyjnym nie pokazujemy stack trace ze względów bezpieczeństwa
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

export default app;