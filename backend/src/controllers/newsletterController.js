import pool from '../config/database.js';
import { generateNewsletterHTML } from '../utils/newsletterTemplate.js';

// Normalize JSON columns (same as newsController)
function normalizeNewsItem(row) {
  if (!row) return row;
  const out = { ...row };
  out.hashtags = Array.isArray(row.hashtags) ? row.hashtags : (typeof row.hashtags === 'string' ? (() => { try { return JSON.parse(row.hashtags); } catch { return []; } })() : []);
  out.image_urls = Array.isArray(row.image_urls) ? row.image_urls : (typeof row.image_urls === 'string' ? (() => { try { return JSON.parse(row.image_urls); } catch { return []; } })() : []);
  out.external_links = Array.isArray(row.external_links) ? row.external_links : (typeof row.external_links === 'string' ? (() => { try { return JSON.parse(row.external_links); } catch { return []; } })() : []);
  return out;
}

/**
 * Generate newsletter HTML
 * GET /api/newsletter/generate?period=14&baseUrl=https://yourdomain.com
 */
export async function generateNewsletter(req, res) {
  try {
    const periodDays = parseInt(req.query.period) || 14;
    const baseUrl = req.query.baseUrl || process.env.FRONTEND_URL || 'http://localhost:5173';

    // Fetch news from the last N days
    const [rows] = await pool.query(
      `SELECT n.*, u.name AS author_name, u.email AS author_email 
       FROM news_items n 
       JOIN users u ON n.user_id = u.id 
       WHERE n.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       ORDER BY n.created_at DESC`,
      [periodDays]
    );

    const newsItems = rows.map(normalizeNewsItem);

    // Generate HTML
    const html = generateNewsletterHTML(newsItems, {
      baseUrl,
      periodDays,
    });

    res.json({
      html,
      count: newsItems.length,
      periodDays,
      baseUrl,
    });
  } catch (error) {
    console.error('Error generating newsletter:', error);
    res.status(500).json({ error: 'Failed to generate newsletter' });
  }
}

export async function previewNewsletter(req, res) {
    try {
      const periodDays = parseInt(req.query.period) || 14;
      const baseUrl = req.query.baseUrl || process.env.FRONTEND_URL || 'http://localhost:5173';
  
      const [rows] = await pool.query(
        `SELECT n.*, u.name AS author_name, u.email AS author_email 
         FROM news_items n 
         JOIN users u ON n.user_id = u.id 
         WHERE n.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         ORDER BY n.created_at DESC`,
        [periodDays]
      );
  
      const newsItems = rows.map(normalizeNewsItem);
      const html = generateNewsletterHTML(newsItems, { baseUrl, periodDays });
  
      res.type('html').send(html);
    } catch (error) {
      console.error('Error generating newsletter preview:', error);
      res.status(500).send('Failed to generate newsletter');
    }
  }
