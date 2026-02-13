import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Edit3 } from 'lucide-react';
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
  const { filters, setFilters } = useFilters();

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
  
    // Date: quick buttons or custom range
    const dateRange = filters.dateRange || 'all';
    const dateStart = filters.dateStart;
    const dateEnd = filters.dateEnd;
    const useCustomRange = dateStart && dateEnd;
  
    if (useCustomRange) {
      const start = new Date(dateStart);
      const end = new Date(dateEnd);
      end.setHours(23, 59, 59, 999);
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
  }, [news, savedPosts, viewMode, filters.search, filters.faculty, filters.dateRange, filters.dateStart, filters.dateEnd, filters.orderBy]);

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
                    <input
                      type="date"
                      value={filters.dateStart || ''}
                      onChange={(e) => setFilters((prev) => ({ ...prev, dateStart: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red"
                    />
                    <input
                      type="date"
                      value={filters.dateEnd || ''}
                      onChange={(e) => setFilters((prev) => ({ ...prev, dateEnd: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date range</label>
                  <div className="flex flex-wrap gap-2">
                    {['all', 'today', 'week', 'month'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setFilters((prev) => ({ ...prev, dateRange: r }))}
                        className={`px-3 py-1.5 text-xs font-bold uppercase rounded-full border transition-all ${
                          (filters.dateRange || 'all') === r
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
    </div>
  );
}