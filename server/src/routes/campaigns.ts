import { Router } from 'express';
import {
  listPublicCampaigns,
  getPublicCampaign,
  adminListCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from '../controllers/campaignController';
import { requireAdmin } from '../middleware/auth';
import ah from '../middleware/asyncHandler';

const router = Router();

// Public
router.get('/', ah(listPublicCampaigns));
router.get('/:slug', ah(getPublicCampaign));

// Admin
router.get('/admin/all', requireAdmin, ah(adminListCampaigns));
router.post('/admin', requireAdmin, ah(createCampaign));
router.patch('/admin/:id', requireAdmin, ah(updateCampaign));
router.delete('/admin/:id', requireAdmin, ah(deleteCampaign));

export default router;
