import { Router } from 'express';
import { ExercisesController } from './exercises.controller';
import passport from 'passport';
import { authorizeRoles } from '../auth/role.middleware';

const router = Router();
const controller = new ExercisesController();

// 1. Odczyt: Wszyscy zalogowani użytkownicy (klienci też, bo muszą widzieć katalog)
router.get(
  '/', 
  passport.authenticate('jwt', { session: false }), 
  controller.getAll
);

router.get(
  '/:id', 
  passport.authenticate('jwt', { session: false }), 
  controller.getById
);

// 2. Tworzenie i Edycja: Tylko Trenerzy i Administratorzy
router.post(
  '/', 
  passport.authenticate('jwt', { session: false }), 
  authorizeRoles('TRAINER', 'ADMIN'), 
  controller.create
);

router.put(
  '/:id', 
  passport.authenticate('jwt', { session: false }), 
  authorizeRoles('TRAINER', 'ADMIN'), 
  controller.update
);

// 3. Usuwanie: Ryzykowne, dlatego dajemy uprawnienia tylko dla Administratora
router.delete(
  '/:id', 
  passport.authenticate('jwt', { session: false }), 
  authorizeRoles('ADMIN'), 
  controller.delete
);

export default router;