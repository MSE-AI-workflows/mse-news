import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getMySavedPosts,
  savePost,
  unsavePost,
} from '../controllers/savedPostsController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/my', getMySavedPosts);
router.post('/', savePost);
router.delete('/:news_item_id', unsavePost);

export default router;
