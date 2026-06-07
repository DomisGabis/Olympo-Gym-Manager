import { Router } from 'express';
import { RelationshipsController } from './relationships.controller';
import passport from 'passport';
import { authorizeRoles } from '../auth/role.middleware';

const router = Router();
const controller = new RelationshipsController();

// GET /api/relationships
// Zwraca dla zalogowanego klienta listę trenerów,
// a dla zalogowanego trenera listę podopiecznych.
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  controller.getRelationships
);

// GET /api/relationships/trainer/:id
// Dla ADMIN i RECEPTIONIST: zwraca listę klientów przypisanych do trenera o podanym id
router.get(
  '/trainer/:id',
  passport.authenticate('jwt', { session: false }),
  authorizeRoles('ADMIN', 'RECEPTIONIST'),
  controller.getClientsForTrainer
);

export default router;
