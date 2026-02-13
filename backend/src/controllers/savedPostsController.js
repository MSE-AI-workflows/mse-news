import pool from '../config/database.js';

function normalizeNewsItem(row) {
  if (!row) return row;
  const out = { ...row };
  out.hashtags = Array.isArray(row.hashtags) ? row.hashtags : (typeof row.hashtags === 'string' ? (() => { try { return JSON.parse(row.hashtags); } catch { return []; } })() : []);
  out.image_urls = Array.isArray(row.image_urls) ? row.image_urls : (typeof row.image_urls === 'string' ? (() => { try { return JSON.parse(row.image_urls); } catch { return []; } })() : []);
  out.external_links = Array.isArray(row.external_links) ? row.external_links : (typeof row.external_links === 'string' ? (() => { try { return JSON.parse(row.external_links); } catch { return []; } })() : []);
  return out;
}

export async function getMySavedPosts(req, res) {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT n.*, u.name AS author_name, u.email AS author_email, sp.created_at AS saved_at
       FROM saved_posts sp
       JOIN news_items n ON sp.news_item_id = n.id
       JOIN users u ON n.user_id = u.id
       WHERE sp.user_id = ?
       ORDER BY sp.created_at DESC`,
      [userId]
    );
    res.json(rows.map(normalizeNewsItem));
  } catch (error) {
    console.error('Error fetching saved posts:', error);
    res.status(500).json({ error: 'Failed to get saved posts' });
  }
}

export async function savePost(req, res) {
  try {
    const userId = req.user.id;
    const { news_item_id } = req.body;

    if (!news_item_id) {
      return res.status(400).json({ error: 'news_item_id is required' });
    }

    const [existing] = await pool.query('SELECT id FROM news_items WHERE id = ?', [news_item_id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'News item not found' });
    }

    await pool.query(
      'INSERT IGNORE INTO saved_posts (user_id, news_item_id) VALUES (?, ?)',
      [userId, news_item_id]
    );

    res.status(201).json({ message: 'Post saved' });
  } catch (error) {
    console.error('Error saving post:', error);
    res.status(500).json({ error: 'Failed to save post' });
  }
}

export async function unsavePost(req, res) {
  try {
    const userId = req.user.id;
    const { news_item_id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM saved_posts WHERE user_id = ? AND news_item_id = ?',
      [userId, news_item_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Saved post not found' });
    }

    res.json({ message: 'Post unsaved' });
  } catch (error) {
    console.error('Error unsaving post:', error);
    res.status(500).json({ error: 'Failed to unsave post' });
  }
}
