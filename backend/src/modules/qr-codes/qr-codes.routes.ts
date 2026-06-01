import { Router } from 'express';
import { QrCodesController } from './qr-codes.controller';
import passport from 'passport';
import { authorizeRoles } from '../auth/role.middleware';

const router = Router();
const qrCodesController = new QrCodesController();

// Punkt dostępowy zabezpieczony tokenem autoryzacyjnym
router.use(passport.authenticate('jwt', { session: false }));

// Tylko zalogowany KLIENT może pobrać swój dynamiczny kod wejściowy
router.get(
  '/', 
  authorizeRoles('CLIENT'), 
  qrCodesController.generate
);

export default router;