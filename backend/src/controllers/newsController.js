import pool from '../config/database.js';

export async function getMyNews(req, res) {
    try{
        const userId = req.user.id;
        const [rows] = await pool.query('SELECT * FROM news_items WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        res.json(rows);
    } catch (error) {
        console.error( 'Error fetching user news:',error);
        res.status(500).json({ error: 'Failed to get news' });
        }}

export async function createNews(req, res){
    try {
        const userId = req.user.id;
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }
        const [result] = await pool.query('INSERT INTO news_items (user_id, title, content, status) VALUES (?, ?, ?, ?)', [userId, title, content, 'draft']);

        const [newItem] = await pool.query('SELECT * FROM news_items WHERE id = ?', [result.insertId]);
        res.status(201).json(newItem[0]);
    } catch (error) {
        console.error( 'Error creating news:',error);
        res.status(500).json({ error: 'Failed to create news' });
    }
}    


export async function updateMyNews(req, res){
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { title, content } = req.body;

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
      
          res.json(updated[0]);
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
      res.json(rows);
    } catch (error) {
      console.error('Error fetching all news:', error);
      res.status(500).json({ message: 'Error fetching news items' });
    }
  }