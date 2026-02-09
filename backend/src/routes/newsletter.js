import express from 'express';
import { generateNewsletter, previewNewsletter } from '../controllers/newsletterController.js';

const router = express.Router();

// Public route - no auth required for MVP (you can add auth later if needed)
router.get('/generate', generateNewsletter);
router.get('/preview', previewNewsletter);
export default router;