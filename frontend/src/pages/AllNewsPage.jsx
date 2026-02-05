import { useState, useEffect } from 'react';
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
        <h1 className="text-2xl font-slab font-bold text-ncsu-gray mb-6 uppercase tracking-tight">List All News</h1>

        <div className="grid grid-cols-1 gap-4 w-full max-w-3xl mx-auto">
          {news.map((item) => (
            <NewsCard
              key={item.id}
              item={item}
              expanded={expandedId}
              onToggleExpand={setExpandedId}
            />
          ))}
        </div>

        {news.length === 0 && (
          <div className="text-center py-16">
            <p className="text-ncsu-gray/80 text-lg">No news items yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}