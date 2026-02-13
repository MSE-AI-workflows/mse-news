import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getMyDrafts,
  createDraft,
  updateDraft,
  deleteDraft,
  publishDraft,
} from '../controllers/draftsController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/my', getMyDrafts);
router.post('/', createDraft);
router.put('/:id', updateDraft);
router.delete('/:id', deleteDraft);
router.post('/:id/publish', publishDraft);

export default router;
