import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './config/database.js';
import passport from './config/passport.js';
import authRoutes from './routes/auth.js';
import newsRoutes from './routes/news.js';
import newsletterRoutes from './routes/newsletter.js';
import publicationsRoutes from './routes/publications.js';
import linkPreviewRoutes from './routes/linkPreview.js';
import draftsRoutes from './routes/drafts.js';
import savedPostsRoutes from './routes/savedPosts.js';
import uploadRoutes from './routes/uploads.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// Resolve project root and serve uploaded images statically
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));


app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.get('/db-test', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT 1 AS result');
      res.json({ ok: true, dbResult: rows[0].result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, error: 'DB connection failed' });
    }
  });

app.use('/api/auth', authRoutes);

app.use('/api/news', newsRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/publications', publicationsRoutes);
app.use('/api/link-preview', linkPreviewRoutes);
app.use('/api/drafts', draftsRoutes);
app.use('/api/saved-posts', savedPostsRoutes);
app.use('/api/uploads', uploadRoutes);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});