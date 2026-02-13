import pool from '../config/database.js';

function normalizeDraft(row) {
  if (!row) return row;
  const out = { ...row };
  out.hashtags = Array.isArray(row.hashtags) ? row.hashtags : (typeof row.hashtags === 'string' ? (() => { try { return JSON.parse(row.hashtags); } catch { return []; } })() : []);
  out.image_urls = Array.isArray(row.image_urls) ? row.image_urls : (typeof row.image_urls === 'string' ? (() => { try { return JSON.parse(row.image_urls); } catch { return []; } })() : []);
  out.external_links = Array.isArray(row.external_links) ? row.external_links : (typeof row.external_links === 'string' ? (() => { try { return JSON.parse(row.external_links); } catch { return []; } })() : []);
  return out;
}

export async function getMyDrafts(req, res) {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query('SELECT * FROM drafts WHERE user_id = ? ORDER BY updated_at DESC', [userId]);
    res.json(rows.map(normalizeDraft));
  } catch (error) {
    console.error('Error fetching drafts:', error);
    res.status(500).json({ error: 'Failed to get drafts' });
  }
}

export async function createDraft(req, res) {
  try {
    const userId = req.user.id;
    const { title, content, hashtags, image_urls, external_links } = req.body;
    const contentVal = content ?? '';
    const hashtagsJson = Array.isArray(hashtags) ? JSON.stringify(hashtags) : (hashtags == null ? null : JSON.stringify([]));
    const imageUrlsJson = Array.isArray(image_urls) ? JSON.stringify(image_urls) : (image_urls == null ? null : JSON.stringify([]));
    const externalLinksJson = Array.isArray(external_links) ? JSON.stringify(external_links) : (external_links == null ? null : JSON.stringify([]));

    const [result] = await pool.query(
      'INSERT INTO drafts (user_id, title, content, hashtags, image_urls, external_links) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, title ?? null, contentVal, hashtagsJson, imageUrlsJson, externalLinksJson]
    );

    const [rows] = await pool.query('SELECT * FROM drafts WHERE id = ?', [result.insertId]);
    res.status(201).json(normalizeDraft(rows[0]));
  } catch (error) {
    console.error('Error creating draft:', error);
    res.status(500).json({ error: 'Failed to create draft' });
  }
}

export async function updateDraft(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, content, hashtags, image_urls, external_links } = req.body;

    const [existing] = await pool.query('SELECT * FROM drafts WHERE id = ? AND user_id = ?', [id, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Draft not found' });
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
      const [updated] = await pool.query('SELECT * FROM drafts WHERE id = ?', [id]);
      return res.json(normalizeDraft(updated[0]));
    }

    values.push(id, userId);
    await pool.query(
      `UPDATE drafts SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ? AND user_id = ?`,
      values
    );

    const [updated] = await pool.query('SELECT * FROM drafts WHERE id = ?', [id]);
    res.json(normalizeDraft(updated[0]));
  } catch (error) {
    console.error('Error updating draft:', error);
    res.status(500).json({ error: 'Failed to update draft' });
  }
}

export async function deleteDraft(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM drafts WHERE id = ? AND user_id = ?', [id, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    await pool.query('DELETE FROM drafts WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Draft deleted successfully' });
  } catch (error) {
    console.error('Error deleting draft:', error);
    res.status(500).json({ error: 'Failed to delete draft' });
  }
}

export async function publishDraft(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [drafts] = await pool.query('SELECT * FROM drafts WHERE id = ? AND user_id = ?', [id, userId]);
    if (drafts.length === 0) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    const d = drafts[0];
    const title = d.title ?? '';
    const content = d.content ?? '';
    if (!title.trim() || !content.trim()) {
      return res.status(400).json({ error: 'Title and content are required to publish' });
    }

    const [result] = await pool.query(
      'INSERT INTO news_items (user_id, title, content, hashtags, image_urls, external_links) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, title, content, d.hashtags ?? '[]', d.image_urls ?? '[]', d.external_links ?? '[]']
    );

    await pool.query('DELETE FROM drafts WHERE id = ? AND user_id = ?', [id, userId]);

    const [newItem] = await pool.query('SELECT * FROM news_items WHERE id = ?', [result.insertId]);
    const normalizeNewsItem = (row) => {
      if (!row) return row;
      const out = { ...row };
      out.hashtags = Array.isArray(row.hashtags) ? row.hashtags : (typeof row.hashtags === 'string' ? (() => { try { return JSON.parse(row.hashtags); } catch { return []; } })() : []);
      out.image_urls = Array.isArray(row.image_urls) ? row.image_urls : (typeof row.image_urls === 'string' ? (() => { try { return JSON.parse(row.image_urls); } catch { return []; } })() : []);
      out.external_links = Array.isArray(row.external_links) ? row.external_links : (typeof row.external_links === 'string' ? (() => { try { return JSON.parse(row.external_links); } catch { return []; } })() : []);
      return out;
    };
    res.status(201).json(normalizeNewsItem(newItem[0]));
  } catch (error) {
    console.error('Error publishing draft:', error);
    res.status(500).json({ error: 'Failed to publish draft' });
  }
}
