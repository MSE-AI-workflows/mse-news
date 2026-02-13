-- Migration: Create drafts and saved_posts tables for LinkedIn-style features
-- Run this against your news app database (same DB as users and news_items).

-- Drafts: same shape as news_items for easy publish flow
CREATE TABLE IF NOT EXISTS drafts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) DEFAULT NULL,
  content TEXT NOT NULL,
  hashtags JSON DEFAULT NULL,
  image_urls JSON DEFAULT NULL,
  external_links JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_drafts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Saved posts: user can save any news item
CREATE TABLE IF NOT EXISTS saved_posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  news_item_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_saved_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_saved_posts_news FOREIGN KEY (news_item_id) REFERENCES news_items(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_news (user_id, news_item_id)
);

-- Optional: indexes for common queries
CREATE INDEX idx_drafts_user_id ON drafts(user_id);
CREATE INDEX idx_saved_posts_user_id ON saved_posts(user_id);
CREATE INDEX idx_saved_posts_news_item_id ON saved_posts(news_item_id);
