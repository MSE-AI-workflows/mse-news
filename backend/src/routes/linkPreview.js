// backend/src/routes/linkPreview.js
import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

// POST /api/link-preview/fetch-linkedin-post
router.post('/fetch-linkedin-post', async (req, res) => {
  try {
    const { url } = req.body;

    // Basic validation
    if (!url || !url.includes('linkedin.com')) {
      return res.status(400).json({ error: 'Invalid LinkedIn URL' });
    }

    // Fetch the HTML (using a desktop-ish User-Agent)
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const $ = cheerio.load(response.data);

    // Core OG fields
    const ogTitle =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      '';
    const ogDescription =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      '';
    const ogImage =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      '';
    const ogUrl =
      $('meta[property="og:url"]').attr('content') ||
      $('meta[property="twitter:url"]').attr('content') ||
      url;

    // Use the OG/description text as our content
    const rawDescription = ogDescription || '';

    // Derived: hashtags from description (e.g. #AI → "AI")
    const hashtagMatches = rawDescription.match(/#\w+/g) || [];
    const hashtags = hashtagMatches.map((tag) => tag.slice(1));

    // Derived: extra external link(s) in the description (e.g. lnkd.in job link)
    const urlsInDescription = rawDescription.match(/https?:\/\/\S+/g) || [];
    // Prefer a non-LinkedIn URL if present, otherwise first URL
    const extraExternal =
      urlsInDescription.find((u) => !u.includes('linkedin.com')) ||
      urlsInDescription[0] ||
      null;

    // Map to NewsCard-like shape
    const image_urls = ogImage ? [ogImage] : [];

    const external_links = [{ label: 'View on LinkedIn', url: ogUrl }];
    if (extraExternal && extraExternal !== ogUrl) {
      external_links.push({
        label: 'External link from post',
        url: extraExternal,
      });
    }

    const payload = {
      title: ogTitle,
      content: rawDescription,
      hashtags,       // string[]
      image_urls,     // string[]
      external_links, // { label, url }[]
    };

    return res.json(payload);
  } catch (error) {
    console.error('Error fetching LinkedIn post:', error.message);
    res.status(500).json({ error: 'Failed to fetch post details' });
  }
});

export default router;