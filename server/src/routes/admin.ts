import { Router } from 'express';
import {
  getStats,
  listDonations,
  exportDonationsCsv,
  listContactMessages,
  markMessageHandled,
} from '../controllers/adminController';
import { requireAdmin } from '../middleware/auth';
import ah from '../middleware/asyncHandler';

const router = Router();

router.use(requireAdmin);

router.get('/stats', ah(getStats));
router.get('/donations', ah(listDonations));
router.get('/donations/export', ah(exportDonationsCsv));
router.get('/contact-messages', ah(listContactMessages));
router.patch('/contact-messages/:id', ah(markMessageHandled));

export default router;
