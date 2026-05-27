import { Router } from 'express';
import { MessagesController } from './messages.controller';
import passport from 'passport';
import { authorizeRoles } from '../auth/role.middleware';

const router = Router();
const controller = new MessagesController();

// 1. Wysłanie wiadomości
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  authorizeRoles('CLIENT', 'TRAINER'),
  controller.send
);

// 2. Pobranie historii czatu z danym kontaktem
router.get(
  '/:contactId',
  passport.authenticate('jwt', { session: false }),
  authorizeRoles('CLIENT', 'TRAINER'),
  controller.getHistory
);

export default router;