import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getMyPublications } from '../controllers/publicationsController.js';

const router = express.Router();


router.use(requireAuth);
router.get('/my', getMyPublications);

export default router;