import { Router } from 'express';
import { AuthController } from './auth.controller';
import passport from 'passport';
import { authorizeRoles } from './role.middleware';

const router = Router();
const authController = new AuthController();

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get(
  '/admin-dashboard',
  passport.authenticate('jwt', { session: false }),
  authorizeRoles('ADMIN'),
  (req, res) => {
    res.json({ message: 'Witaj w panelu administratora Olympo!' });
  }
);

// NOWA ŚCIEŻKA: Bezpieczne usuwanie użytkownika
router.delete(
  '/users/:id',
  passport.authenticate('jwt', { session: false }),
  authorizeRoles('ADMIN'),
  authController.delete
);

export default router;