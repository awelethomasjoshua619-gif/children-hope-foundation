import { Router } from 'express';
import { getImpact } from '../controllers/impactController';
import { updateImpactStat, updateSiteSettings } from '../controllers/impactController';
import { requireAdmin } from '../middleware/auth';
import ah from '../middleware/asyncHandler';

const router = Router();

// Public
router.get('/', ah(getImpact));

// Admin
router.put('/stats/:id', requireAdmin, ah(updateImpactStat));
router.put('/settings', requireAdmin, ah(updateSiteSettings));

export default router;
