import { Router } from 'express';
import {
  initializeDonation,
  verifyDonation,
  paystackWebhook,
  myDonations,
  guestHistory,
} from '../controllers/donationController';
import { requireAuth } from '../middleware/auth';
import { donationLimiter } from '../middleware/rateLimiter';
import ah from '../middleware/asyncHandler';

const router = Router();

router.post('/initialize', donationLimiter, ah(initializeDonation));
router.post('/verify', donationLimiter, ah(verifyDonation));
router.post('/webhook', ah(paystackWebhook));
router.get('/mine', requireAuth, ah(myDonations));
router.get('/history', donationLimiter, ah(guestHistory));

export default router;
