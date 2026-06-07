import { Router } from 'express';
import { RelationshipsController } from './relationships.controller';
import passport from 'passport';

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

export default router;
