import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import api from '../api/client';
import NewsCard from '../components/NewsCard';
import { useFilters } from '../context/FilterContext';
import { FACULTIES } from '../constants.jsx';

export default function AllNewsPage() {
  const [news, setNews] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const { filters, setFilters } = useFilters();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await api.get('/news/all');
      setNews(res.data);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const filteredNews = useMemo(() => {
    let result = [...news];
  
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
  }, [news, filters.search, filters.faculty, filters.dateRange, filters.dateStart, filters.dateEnd, filters.orderBy]);

  return (
    <div className="min-h-screen bg-[#f2f2f2] font-sans flex flex-col lg:flex-row">
      {/* Sidebar: filters (only on All News) */}
      <aside className="shrink-0 w-full lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 lg:sticky lg:top-20 lg:self-start lg:h-[calc(100vh-5rem)] lg:overflow-y-auto">
        <div className="p-4 space-y-4">
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
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
            <select
              value={filters.faculty}
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
                    filters.dateRange === r
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
      </aside>

      {/* Main feed */}
      <div className="flex-1 min-w-0 px-4 py-8">

        <div className="grid grid-cols-1 gap-4 w-full max-w-3xl mx-auto">
          {filteredNews.map((item) => (
            <NewsCard
              key={item.id}
              item={item}
              expanded={expandedId}
              onToggleExpand={setExpandedId}
              searchQuery={filters.search?.trim() || ''}
            />
          ))}
        </div>

        {filteredNews.length === 0 && (
  <div className="text-center py-16">
    <p className="text-ncsu-gray/80 text-lg">
      {news.length === 0
        ? 'No news items yet.'
        : 'No news match your filters. Try changing search, faculty, or date range.'}
    </p>
  </div>
)}
      </div>
    </div>
  );
}