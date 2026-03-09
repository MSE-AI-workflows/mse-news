import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Edit3 } from 'lucide-react';
import DOMPurify from 'dompurify';
import api from '../api/client';
import NewsCard from '../components/NewsCard';
import ProfileSidebar from '../components/ProfileSidebar';
import { useFilters } from '../context/FilterContext';
import { FACULTIES } from '../constants.jsx';
import { useAuth } from '../context/AuthContext';

export default function AllNewsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'saved'
  const [previewItem, setPreviewItem] = useState(null);
  const [previewImageIdx, setPreviewImageIdx] = useState(0);
  const { filters, setFilters } = useFilters();

  const openPreview = (item) => {
    setPreviewImageIdx(0);
    setPreviewItem(item);
  };

  useEffect(() => {
    if (!previewItem) return;
    document.body.style.overflow = 'hidden';
    const images = previewItem.image_urls || [];
    const handleKey = (e) => {
      if (e.key === 'Escape') setPreviewItem(null);
      if (e.key === 'ArrowLeft') setPreviewImageIdx((prev) => Math.max(0, prev - 1));
      if (e.key === 'ArrowRight') setPreviewImageIdx((prev) => Math.min(images.length - 1, prev + 1));
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [previewItem]);

  useEffect(() => {
    fetchNews();
    fetchSavedPosts();
  }, []);

  const fetchSavedPosts = async () => {
    try {
      const res = await api.get('/saved-posts/my');
      setSavedPosts(res.data);
    } catch (error) {
      console.error('Error fetching saved posts:', error);
    }
  };

  const handleFilterChange = (change) => {
    if (change.type === 'saved') {
      setViewMode('saved');
    } else {
      setViewMode('all');
    }
  };

  const savedPostIds = useMemo(() => new Set(savedPosts.map((p) => p.id)), [savedPosts]);

  const handleToggleSave = async (newsItemId) => {
    try {
      if (savedPostIds.has(newsItemId)) {
        await api.delete(`/saved-posts/${newsItemId}`);
      } else {
        await api.post('/saved-posts', { news_item_id: newsItemId });
      }
      fetchSavedPosts();
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const fetchNews = async () => {
    try {
      const res = await api.get('/news/all');
      setNews(res.data);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const filteredNews = useMemo(() => {
    let result = viewMode === 'saved' ? [...savedPosts] : [...news];
  
    // Search (title, content, hashtags, author)
    const q = (filters.search || '').toLowerCase().trim();
    if (q) {
      result = result.filter((item) => {
        const title = (item.title || '').toLowerCase();
        const content = (item.content || '').toLowerCase();
        const tags = Array.isArray(item.hashtags) ? item.hashtags.join(' ').toLowerCase() : '';
        const author = (item.author_name || '').toLowerCase();
        return title.includes(q) || content.includes(q) || tags.includes(q) || author.includes(q);
      });
    }
  
    // Faculty
    const faculty = filters.faculty || 'All Faculty';
    if (faculty === 'Others') {
      const facultyNames = FACULTIES.filter((f) => f !== 'All Faculty' && f !== 'Others');
      result = result.filter((item) => {
        const author = (item.author_name || '').trim();
        return author && !facultyNames.includes(author);
      });
    } else if (faculty !== 'All Faculty') {
      result = result.filter((item) => (item.author_name || '').trim() === faculty);
    }
  
    // Date: custom range takes priority over quick buttons
    const dateRange = filters.dateRange || 'all';
    const dateStart = filters.dateStart;
    const dateEnd = filters.dateEnd;

    if (dateStart || dateEnd) {
      const start = dateStart ? new Date(dateStart + 'T00:00:00') : new Date(0);
      const end = dateEnd ? new Date(dateEnd + 'T23:59:59.999') : new Date();
      result = result.filter((item) => {
        const d = new Date(item.created_at);
        return d >= start && d <= end;
      });
    } else if (dateRange !== 'all') {
      const now = new Date();
      result = result.filter((item) => {
        const d = new Date(item.created_at);
        if (dateRange === 'today') return d.toDateString() === now.toDateString();
        if (dateRange === 'week') {
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return d >= weekAgo;
        }
        if (dateRange === 'month') {
          const monthAgo = new Date(now);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return d >= monthAgo;
        }
        return true;
      });
    }
  
    if (filters.excludeMine && user) {
      result = result.filter((item) => item.author_email !== user.email);
    }

    // Order by
    const orderBy = filters.orderBy || 'newest';
    result.sort((a, b) => {
      if (orderBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (orderBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      const ta = (a.title || '').toLowerCase();
      const tb = (b.title || '').toLowerCase();
      if (orderBy === 'title-az') return ta.localeCompare(tb);
      if (orderBy === 'title-za') return tb.localeCompare(ta);
      return 0;
    });

    return result;
  }, [news, savedPosts, viewMode, filters.search, filters.faculty, filters.dateRange, filters.dateStart, filters.dateEnd, filters.orderBy, filters.excludeMine, user]);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2] font-sans">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="lg:grid lg:grid-cols-12 gap-6">
          {/* Left Column: Profile Sidebar */}
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-20 lg:self-start">
              <ProfileSidebar onFilterChange={handleFilterChange} savedCountFromParent={savedPosts.length} />
            </div>
          </aside>

          {/* Center Column: Feed */}
          <main className="lg:col-span-6">
            {/* Start a post card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-ncsu-gray text-white flex items-center justify-center text-sm font-bold">
                  {user ? getInitials(user.name) : 'U'}
                </div>
                <button
                  onClick={() => navigate('/dashboard/write')}
                  className="flex-1 text-left px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-full text-sm text-gray-500 transition-colors"
                >
                  Start a post...
                </button>
              </div>
            </div>

            {/* View mode indicator */}
            {viewMode === 'saved' && (
              <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  Showing saved posts ({savedPosts.length})
                </p>
                <button
                  onClick={() => setViewMode('all')}
                  className="text-xs text-blue-600 hover:underline mt-1"
                >
                  Show all news →
                </button>
              </div>
            )}

            {/* News feed */}
            <div className="space-y-4">
              {filteredNews.map((item) => (
                <NewsCard
                  key={item.id}
                  item={item}
                  expanded={expandedId}
                  onToggleExpand={setExpandedId}
                  searchQuery={filters.search?.trim() || ''}
                  isSaved={savedPostIds.has(item.id)}
                  onToggleSave={handleToggleSave}
                  onPreview={() => openPreview(item)}
                />
              ))}
            </div>

            {filteredNews.length === 0 && (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
                <p className="text-ncsu-gray/80 text-lg">
                  {viewMode === 'saved'
                    ? 'No saved posts yet.'
                    : news.length === 0
                    ? 'No news items yet.'
                    : 'No news match your filters. Try changing search, faculty, or date range.'}
                </p>
              </div>
            )}
          </main>

          {/* Right Column: Filters */}
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-20 lg:self-start lg:h-[calc(100vh-5rem)] lg:overflow-y-auto">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
                <div className="flex items-center gap-2 text-ncsu-gray font-bold text-xs uppercase tracking-wide">
                  <SlidersHorizontal size={16} />
                  <span>Filters</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="News, faculty, hashtags..."
                      value={filters.search || ''}
                      onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
                  <select
                    value={filters.faculty || 'All Faculty'}
                    onChange={(e) => setFilters((prev) => ({ ...prev, faculty: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red"
                  >
                    {FACULTIES.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order by</label>
                  <select
                    value={filters.orderBy || 'newest'}
                    onChange={(e) => setFilters((prev) => ({ ...prev, orderBy: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="title-az">Title A-Z</option>
                    <option value="title-za">Title Z-A</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom date range</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-9 flex-shrink-0">Start</span>
                      <input
                        type="date"
                        value={filters.dateStart || ''}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setFilters((prev) => ({ ...prev, dateStart: e.target.value, dateRange: 'all' }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-9 flex-shrink-0">End</span>
                      <input
                        type="date"
                        value={filters.dateEnd || ''}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setFilters((prev) => ({ ...prev, dateEnd: e.target.value, dateRange: 'all' }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red"
                      />
                    </div>
                    {(filters.dateStart || filters.dateEnd) && (
                      <button
                        type="button"
                        onClick={() => setFilters((prev) => ({ ...prev, dateStart: '', dateEnd: '' }))}
                        className="text-xs text-ncsu-red hover:underline"
                      >
                        Clear custom dates
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Exclude my posts</label>
                  <button
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, excludeMine: !prev.excludeMine }))}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      filters.excludeMine ? 'bg-ncsu-red' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        filters.excludeMine ? 'translate-x-4.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date range</label>
                  <div className="flex flex-wrap gap-2">
                    {['all', 'today', 'week', 'month'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setFilters((prev) => ({ ...prev, dateRange: r, dateStart: '', dateEnd: '' }))}
                        className={`px-3 py-1.5 text-xs font-bold uppercase rounded-full border transition-all ${
                          (filters.dateRange || 'all') === r && !filters.dateStart && !filters.dateEnd
                            ? 'bg-ncsu-red text-white border-ncsu-red'
                            : 'text-gray-500 border-gray-200 hover:border-ncsu-red hover:text-ncsu-red'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Post Preview Modal — LinkedIn-style split layout */}
      {previewItem && (() => {
        const images = Array.isArray(previewItem.image_urls) ? previewItem.image_urls : [];
        const hasImages = images.length > 0;

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={() => setPreviewItem(null)}
          >
            <div
              className={`flex ${hasImages ? 'w-[95vw] max-w-6xl' : 'w-full max-w-2xl'} max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left: Image carousel */}
              {hasImages && (
                <div className="relative flex-shrink-0 w-[55%] bg-black flex items-center justify-center">
                  <img
                    src={images[previewImageIdx]}
                    alt=""
                    className="max-w-full max-h-[90vh] object-contain select-none"
                  />

                  {/* Previous arrow */}
                  {images.length > 1 && previewImageIdx > 0 && (
                    <button
                      onClick={() => setPreviewImageIdx((i) => i - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center text-gray-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                  )}

                  {/* Next arrow */}
                  {images.length > 1 && previewImageIdx < images.length - 1 && (
                    <button
                      onClick={() => setPreviewImageIdx((i) => i + 1)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center text-gray-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>
                  )}

                  {/* Image counter */}
                  {images.length > 1 && (
                    <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                      {previewImageIdx + 1} / {images.length}
                    </span>
                  )}
                </div>
              )}

              {/* Right: Content panel */}
              <div className={`flex flex-col ${hasImages ? 'w-[45%]' : 'w-full'} max-h-[90vh]`}>
                {/* Header */}
                <div className="flex items-start justify-between p-5 border-b border-gray-200 flex-shrink-0">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-ncsu-gray text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {getInitials(previewItem.author_name || previewItem.author_email || 'U')}
                    </div>
                    <div>
                      {previewItem.author_name && (
                        <p className="font-semibold text-gray-900">{previewItem.author_name}</p>
                      )}
                      {previewItem.author_email && (
                        <p className="text-xs text-gray-500">{previewItem.author_email}</p>
                      )}
                      {previewItem.created_at && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(previewItem.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setPreviewItem(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none px-2 flex-shrink-0"
                  >
                    ×
                  </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {previewItem.title && (
                    <h2 className="text-lg font-bold text-gray-900 break-words">{previewItem.title}</h2>
                  )}

                  {previewItem.content && (
                    /<[a-z][\s\S]*>/i.test(previewItem.content) ? (
                      <div
                        className="text-gray-700 text-sm leading-relaxed [&_a]:text-ncsu-red [&_a]:hover:underline [&_p]:mb-2 [&_p:last-child]:mb-0"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(previewItem.content) }}
                      />
                    ) : (
                      <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                        {previewItem.content}
                      </div>
                    )
                  )}

                  {Array.isArray(previewItem.hashtags) && previewItem.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {previewItem.hashtags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-xs font-medium bg-ncsu-red/10 text-ncsu-red">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {Array.isArray(previewItem.external_links) && previewItem.external_links.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {previewItem.external_links.map((link, i) => (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-ncsu-red hover:underline"
                        >
                          {link.label || link.url}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}