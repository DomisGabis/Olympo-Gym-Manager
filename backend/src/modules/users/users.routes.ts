import { Router } from 'express';
import { UsersController } from './users.controller';
import passport from 'passport';
import { authorizeRoles } from '../auth/role.middleware';

const router = Router();
const usersController = new UsersController();

// Wszystkie poniższe trasy wymagają zalogowania (tokenu JWT)
router.use(passport.authenticate('jwt', { session: false }));

router.get('/profile', usersController.getProfile); // Każdy zalogowany widzi swój profil
router.patch('/profile', usersController.updateProfile); // Edycja własnego profilu użytkownika
router.get('/trainers', usersController.getTrainers); // Każdy zalogowany widzi listę trenerów z paginacją
// router.get('/:id', usersController.getUserById); // Pobierz profil użytkownika po id
router.get('/clients', authorizeRoles('ADMIN', 'RECEPTIONIST'), usersController.getClients); // Lista klientów z paginacją
router.get('/receptionists', authorizeRoles('ADMIN', 'RECEPTIONIST'), usersController.getReceptionists); // Lista recepcjonistów
router.get('/admins', authorizeRoles('ADMIN', 'RECEPTIONIST'), usersController.getAdmins); // Lista administratorów
router.get('/role/:role', authorizeRoles('ADMIN', 'RECEPTIONIST'), usersController.getUsersByRole); // Lista użytkowników według roli
router.get('/counts', authorizeRoles('ADMIN', 'RECEPTIONIST'), usersController.getCounts); // Statystyki liczby użytkowników

// Panel managera/recepcji: pozwala pobierać wszystkich, bądź filtrować:
// np. GET /api/users?page=1&limit=20&role=CLIENT
router.get('/', authorizeRoles('ADMIN', 'RECEPTIONIST'), usersController.getAllUsers);
router.patch('/:id', authorizeRoles('ADMIN'), usersController.updateUserById);
router.delete('/:id', authorizeRoles('ADMIN'), usersController.delete);

export default router;