import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getMyNews, createNews, updateMyNews, deleteMyNews, getAllNews } from '../controllers/newsController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/my',  getMyNews);
router.post('/my', createNews);
router.put('/my/:id',  updateMyNews);
router.delete('/my/:id', deleteMyNews);
router.get('/all', getAllNews);

export default router;