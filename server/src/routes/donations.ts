import { Router } from 'express';
import {
  initializeDonation,
  verifyDonation,
  handleWebhook,
  getMyDonations,
} from '../controllers/donationController';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { donationLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/initialize', optionalAuthenticate, donationLimiter, initializeDonation);
router.get('/verify/:ref', verifyDonation);
router.post('/webhook', handleWebhook);
router.get('/mine', authenticate, getMyDonations);

export default router;
