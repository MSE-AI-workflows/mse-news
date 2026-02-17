import express from 'express';
import axios from 'axios';

const router = express.Router();

const POLITE_EMAIL = process.env.CROSSREF_MAILTO || 'test@example.com';

/**
 * Strips JATS/XML tags from abstract for plain-text display.
 * CrossRef often returns abstract with <jats:p>, <jats:sec>, etc.
 */
function stripAbstractXml(abstract) {
  if (!abstract || typeof abstract !== 'string') return abstract;
  return abstract
    .replace(/<jats:p[^>]*>/gi, '\n')
    .replace(/<\/jats:p>/gi, '')
    .replace(/<jats:sec[^>]*>/gi, '\n')
    .replace(/<\/jats:sec>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

/**
 * GET /api/doi-fetch?doi=10.1126/science.1225829
 * Fetches publication metadata from CrossRef given a DOI.
 * Use this to test DOI-based abstract fetching.
 */
router.get('/', async (req, res) => {
  try {
    const doi = req.query.doi?.trim();
    if (!doi) {
      return res.status(400).json({ error: 'Missing doi query parameter' });
    }

    const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}?mailto=${encodeURIComponent(POLITE_EMAIL)}`;
    const response = await axios.get(url, {
      headers: { Accept: 'application/json' },
      timeout: 10000,
    });

    const data = response.data;
    if (!data?.message) {
      return res.status(404).json({ error: 'No metadata found for this DOI' });
    }

    const work = data.message;

    const authors = Array.isArray(work.author)
      ? work.author.map((a) => `${a.given || ''} ${a.family || ''}`.trim()).filter(Boolean)
      : [];

    const publishedDate = work.published?.['date-parts']?.[0]
      ? work.published['date-parts'][0].join('-')
      : null;

    let abstract = work.abstract || null;
    if (abstract && typeof abstract === 'string') {
      abstract = stripAbstractXml(abstract);
    }

    const payload = {
      doi: work.DOI,
      title: work.title?.[0] ?? null,
      type: work.type ?? null,
      published: publishedDate,
      authors,
      abstract,
      rawAbstract: work.abstract ?? null,
    };

    return res.json(payload);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return res.status(404).json({ error: 'DOI not found in CrossRef' });
    }
    console.error('DOI fetch error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch DOI metadata' });
  }
});

export default router;
