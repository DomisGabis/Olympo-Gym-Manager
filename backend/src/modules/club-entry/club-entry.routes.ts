import { Router } from 'express';
import { ClubEntryController } from './club-entry.controller';
import passport from 'passport';
import { authorizeRoles } from '../auth/role.middleware';

const router = Router();
const clubEntryController = new ClubEntryController();

router.use(passport.authenticate('jwt', { session: false }));

router.get(
  '/my', 
  authorizeRoles('CLIENT', 'TRAINER', 'RECEPTIONIST', 'ADMIN'), 
  clubEntryController.getMyHistory
);

router.post(
  '/', 
  authorizeRoles('RECEPTIONIST', 'ADMIN'), 
  clubEntryController.processEntry
);

export default router;