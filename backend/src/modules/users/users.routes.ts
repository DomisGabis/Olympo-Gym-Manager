import { Router } from 'express';
import { UsersController } from './users.controller';
import passport from 'passport';
import { authorizeRoles } from '../auth/role.middleware';

const router = Router();
const usersController = new UsersController();

// Wszystkie poniższe trasy wymagają zalogowania (tokenu JWT)
router.use(passport.authenticate('jwt', { session: false }));

router.get('/profile', usersController.getProfile); // Każdy zalogowany widzi swój profil
router.get('/trainers', usersController.getTrainers); // Każdy zalogowany widzi listę trenerów z paginacją

// Panel managera/recepcji: pozwala pobierać wszystkich, bądź filtrować:
// np. GET /api/users?page=1&limit=20&role=CLIENT
router.get('/', authorizeRoles('ADMIN', 'RECEPTIONIST'), usersController.getAllUsers);

export default router;