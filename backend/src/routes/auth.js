import express from 'express';
import passport from '../config/passport.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }), (req, res) => {
    res.redirect('http://localhost:5173/dashboard');
});

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to logout' });
        }
    });
});

router.get('/me', requireAuth, (req, res) => {
    res.json({
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
    });
  });

  router.post('/logout', requireAuth, (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.json({ message: 'Logged out successfully' });
    });
  });
  
  export default router;