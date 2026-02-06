import pool from '../config/database.js';


// Ensure JSON columns are arrays for frontend (MySQL may return parsed or string)
function normalizeNewsItem(row) {
  if (!row) return row;
  const out = { ...row };
  out.hashtags = Array.isArray(row.hashtags) ? row.hashtags : (typeof row.hashtags === 'string' ? (() => { try { return JSON.parse(row.hashtags); } catch { return []; } })() : []);
  out.image_urls = Array.isArray(row.image_urls) ? row.image_urls : (typeof row.image_urls === 'string' ? (() => { try { return JSON.parse(row.image_urls); } catch { return []; } })() : []);
  out.external_links = Array.isArray(row.external_links) ? row.external_links : (typeof row.external_links === 'string' ? (() => { try { return JSON.parse(row.external_links); } catch { return []; } })() : []);
  return out;
}

export async function getMyNews(req, res) {
    try{
        const userId = req.user.id;
        const [rows] = await pool.query('SELECT * FROM news_items WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        res.json(rows.map(normalizeNewsItem));
    } catch (error) {
        console.error( 'Error fetching user news:',error);
        res.status(500).json({ error: 'Failed to get news' });
        }}

        export async function createNews(req, res) {
          try {
              const userId = req.user.id;
              const { title, content, hashtags, image_urls, external_links } = req.body;
              if (!title || !content) {
                  return res.status(400).json({ error: 'Title and content are required' });
              }
              const hashtagsJson = Array.isArray(hashtags) ? JSON.stringify(hashtags) : (hashtags == null ? null : JSON.stringify([]));
              const imageUrlsJson = Array.isArray(image_urls) ? JSON.stringify(image_urls) : (image_urls == null ? null : JSON.stringify([]));
              const externalLinksJson = Array.isArray(external_links) ? JSON.stringify(external_links) : (external_links == null ? null : JSON.stringify([]));
      
              const [result] = await pool.query(
                  'INSERT INTO news_items (user_id, title, content, hashtags, image_urls, external_links) VALUES (?, ?, ?, ?, ?, ?)',
                  [userId, title, content, hashtagsJson, imageUrlsJson, externalLinksJson]
              );
      
              const [newItem] = await pool.query('SELECT * FROM news_items WHERE id = ?', [result.insertId]);
              res.status(201).json(normalizeNewsItem(newItem[0]));
          } catch (error) {
              console.error('Error creating news:', error);
              res.status(500).json({ error: 'Failed to create news' });
          }
      }

export async function updateMyNews(req, res){
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { title, content, hashtags, image_urls, external_links } = req.body;

        const [existing] = await pool.query(
            'SELECT * FROM news_items WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        if (existing.length === 0) {
            return res.status(404).json({ error: 'News item not found' });
        }

        const updates = [];
        const values = [];
        if (title !== undefined) {
            updates.push('title = ?');
            values.push(title);
        }
        if (content !== undefined) {
            updates.push('content = ?');
            values.push(content);
        }
        if (hashtags !== undefined) {
          updates.push('hashtags = ?');
          values.push(Array.isArray(hashtags) ? JSON.stringify(hashtags) : JSON.stringify([]));
      }
      if (image_urls !== undefined) {
          updates.push('image_urls = ?');
          values.push(Array.isArray(image_urls) ? JSON.stringify(image_urls) : JSON.stringify([]));
      }
      if (external_links !== undefined) {
          updates.push('external_links = ?');
          values.push(Array.isArray(external_links) ? JSON.stringify(external_links) : JSON.stringify([]));
      }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }
        values.push(id, userId);
        await pool.query(
            `UPDATE news_items SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ? AND user_id = ?`,
            values
          );
      
          const [updated] = await pool.query(
            'SELECT * FROM news_items WHERE id = ?',
            [id]
          );
      
          res.json(normalizeNewsItem(updated[0]));
    } catch (error) {
        console.error( 'Error updating news:',error);
        res.status(500).json({ error: 'Failed to update news' });
    }
}

export async function deleteMyNews(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
  
      // Check if news item exists and belongs to user
      const [existing] = await pool.query(
        'SELECT * FROM news_items WHERE id = ? AND user_id = ?',
        [id, userId]
      );
  
      if (existing.length === 0) {
        return res.status(404).json({ message: 'News item not found' });
      }
  
      await pool.query(
        'DELETE FROM news_items WHERE id = ? AND user_id = ?',
        [id, userId]
      );
  
      res.json({ message: 'News item deleted successfully' });
    } catch (error) {
      console.error('Error deleting news:', error);
      res.status(500).json({ message: 'Error deleting news item' });
    }
  }

  export async function getAllNews(req, res) {
    try {
      const [rows] = await pool.query(
        `SELECT n.*, u.name AS author_name, u.email AS author_email 
         FROM news_items n 
         JOIN users u ON n.user_id = u.id 
         ORDER BY n.created_at DESC`
      );
      res.json(rows.map(normalizeNewsItem));
    } catch (error) {
      console.error('Error fetching all news:', error);
      res.status(500).json({ message: 'Error fetching news items' });
    }
  }