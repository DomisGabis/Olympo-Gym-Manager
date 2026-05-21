import { Router } from 'express';
import { AuthController } from './auth.controller';
import passport from 'passport';
import { authorizeRoles } from './role.middleware';

const router = Router();
const authController = new AuthController();

// 1. Trasy w pełni publiczne (rejestracja i logowanie)
router.post('/register', authController.register);
router.post('/login', authController.login);

// 2. Przykład trasy zabezpieczonej (Tylko dla zalogowanych z odpowiednią rolą)
// Ta trasa posłuży nam w przyszłości do testowania działania ról
router.get(
  '/admin-dashboard',
  passport.authenticate('jwt', { session: false }), // Krok 1: Czy zalogowany tokenem JWT?
  authorizeRoles('ADMIN'),                          // Krok 2: Czy to Administrator?
  (req, res) => {
    res.json({ message: 'Witaj w tajnym panelu administratora Olympo!' });
  }
);

export default router;