import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import api from '../api/client';
import NewsCard from '../components/NewsCard';
import { useFilters } from '../context/FilterContext';

const ORDER_BY_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'title-az', label: 'Title A–Z' },
  { value: 'title-za', label: 'Title Z–A' },
];

export default function ProfilePage() {
    const { user } = useAuth();
    const { filters, setFilters } = useFilters();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [news, setNews] = useState([]);
    const [savedPosts, setSavedPosts] = useState([]);
    const [drafts, setDrafts] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [publications, setPublications] = useState([]);

    const section = searchParams.get('section') || 'posts';

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
          return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name[0].toUpperCase();
    };

    const fetchPublications = async () => {
        try {
          const res = await api.get('/publications/my');
          // Add author info from logged-in user
          const pubsWithAuthor = res.data.map(item => ({
              ...item,
              author_name: item.author_name || user?.name || null,
              author_email: item.author_email || user?.email || null,
          }));
          setPublications(pubsWithAuthor);
        } catch (err) {
          console.error('Error fetching publications:', err);
        }
      };

    const fetchNews = async () => {
        try {
            const res = await api.get('/news/my');
            // Add author info from logged-in user
            const newsWithAuthor = res.data.map(item => ({
                ...item,
                author_name: item.author_name || user?.name || null,
                author_email: item.author_email || user?.email || null,
            }));
            setNews(newsWithAuthor);
        } catch (error) {
            console.error('Error fetching news:', error);
        }
    };

    const fetchSavedPosts = async () => {
        try {
            const res = await api.get('/saved-posts/my');
            setSavedPosts(res.data);
        } catch (error) {
            console.error('Error fetching saved posts:', error);
        }
    };

    const fetchDrafts = async () => {
        try {
            const res = await api.get('/drafts/my');
            setDrafts(res.data);
        } catch (error) {
            console.error('Error fetching drafts:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNews();
            fetchPublications();
            fetchSavedPosts();
            fetchDrafts();
        }
    }, [user]);

    useEffect(() => {
        if (searchParams.get('add') === '1') {
            navigate('/dashboard/write');
            setSearchParams({}, { replace: true });
        }
    }, [searchParams]);

    const handleEdit = (item) => {
        navigate('/dashboard/write', { state: { editPost: item } });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this news item?')) return;
        try {
            await api.delete(`/news/my/${id}`);
            fetchNews();
        } catch (error) {
            console.error('Error deleting news:', error);
        }
    };

    const handleDeleteDraft = async (id) => {
        if (!window.confirm('Are you sure you want to delete this draft?')) return;
        try {
            await api.delete(`/drafts/${id}`);
            fetchDrafts();
        } catch (error) {
            console.error('Error deleting draft:', error);
        }
    };

    const handleEditDraft = (draft) => {
        navigate(`/dashboard/write?edit=${draft.id}`);
    };

    const handlePublishPublicationToNews = (pubItem) => {
        if (!pubItem?.doi) return;
        navigate(`/dashboard/write?doi=${encodeURIComponent(pubItem.doi)}`, {
            state: {
                publicationTitle: pubItem.title || 'Untitled',
                journal: pubItem.journal || '',
                authors: Array.isArray(pubItem.authors) ? pubItem.authors : [],
            },
        });
    };

    const handlePublishDraft = async (id) => {
        if (!window.confirm('Publish this draft as a news post?')) return;
        try {
            await api.post(`/drafts/${id}/publish`);
            fetchDrafts();
            fetchNews();
            navigate('/dashboard/profile?section=posts');
        } catch (error) {
            console.error('Error publishing draft:', error);
        }
    };


    const applyFilters = (items) => {
        let result = [...items];

        const q = (filters.search || '').toLowerCase().trim();
        if (q) {
            result = result.filter((item) => {
                const title = (item.title || '').toLowerCase();
                const content = (item.content || '').toLowerCase();
                const tags = Array.isArray(item.hashtags) ? item.hashtags.join(' ').toLowerCase() : '';
                return title.includes(q) || content.includes(q) || tags.includes(q);
            });
        }

        const now = new Date();
        const dateRange = filters.dateRange || 'all';
        if (dateRange !== 'all') {
            result = result.filter((item) => {
                const d = new Date(item.created_at || item.updated_at);
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

        const orderBy = filters.orderBy || 'newest';
        result.sort((a, b) => {
            const dateA = new Date(a.created_at || a.updated_at || 0);
            const dateB = new Date(b.created_at || b.updated_at || 0);
            if (orderBy === 'newest') return dateB - dateA;
            if (orderBy === 'oldest') return dateA - dateB;
            const ta = (a.title || '').toLowerCase();
            const tb = (b.title || '').toLowerCase();
            if (orderBy === 'title-az') return ta.localeCompare(tb);
            if (orderBy === 'title-za') return tb.localeCompare(ta);
            return 0;
        });

        return result;
    };

    const filteredNews = useMemo(() => applyFilters(news), [news, filters.search, filters.dateRange, filters.orderBy]);
    const filteredSavedPosts = useMemo(() => applyFilters(savedPosts), [savedPosts, filters.search, filters.dateRange, filters.orderBy]);
    const filteredDrafts = useMemo(() => applyFilters(drafts), [drafts, filters.search, filters.dateRange, filters.orderBy]);
    const filteredPublications = useMemo(() => applyFilters(publications), [publications, filters.search, filters.dateRange, filters.orderBy]);

    return (
        <div className="min-h-screen bg-[#f2f2f2] font-sans flex flex-col lg:flex-row">
            {/* Filters sidebar */}
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
                                placeholder="Title, description, hashtags..."
                                value={filters.search || ''}
                                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red"
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
                                        (filters.dateRange || 'all') === r ? 'bg-ncsu-red text-white border-ncsu-red' : 'text-gray-500 border-gray-200 hover:border-ncsu-red hover:text-ncsu-red'
                                    }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Order by</label>
                        <select
                            value={filters.orderBy || 'newest'}
                            onChange={(e) => setFilters((prev) => ({ ...prev, orderBy: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red"
                        >
                            {ORDER_BY_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0 px-4 py-8">
                <div className="max-w-3xl mx-auto">
                    {/* Tab Navigation */}
                    <div className="bg-white border-b border-gray-200 mb-6 rounded-t-lg overflow-hidden">
                        <div className="flex gap-1 overflow-x-auto">
                            {[
                                { id: 'posts', label: 'My Posts', count: news.length },
                                { id: 'publications', label: 'Publications', count: publications.length },
                                { id: 'saved', label: 'Saved Posts', count: savedPosts.length },
                                { id: 'drafts', label: 'Drafts', count: drafts.length },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setSearchParams({ section: tab.id })}
                                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                        section === tab.id
                                            ? 'border-ncsu-red text-ncsu-red'
                                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                                    }`}
                                >
                                    {tab.label}
                                    {tab.count > 0 && (
                                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                            section === tab.id ? 'bg-ncsu-red/20 text-ncsu-red' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8">
                    {/* My Posts */}
                    {section === 'posts' && (
                        <div className="space-y-4">
                            {/* Start a post card (same pattern as AllNewsPage) */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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

                            {filteredNews.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4 w-full">
                                    {filteredNews.map((item) => (
                                        <NewsCard
                                            key={item.id}
                                            item={item}
                                            expanded={expandedId}
                                            onToggleExpand={setExpandedId}
                                            showActions
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            searchQuery={filters.search?.trim() || ''}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                                    <p className="text-ncsu-gray/80 text-lg">
                                        {news.length === 0
                                            ? 'No posts yet. Click "Start a post" above to get started!'
                                            : 'No posts match your filters.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* My Publications */}
                    {section === 'publications' && (
                        <div className="space-y-3">
                            <p className="text-xs text-gray-500">
                                Showing your 10 most recent publications from the MSE publications database.
                            </p>
                            {filteredPublications.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4 w-full">
                                    {filteredPublications.map((item) => (
                                        <NewsCard
                                            key={item.id}
                                            item={item}
                                            expanded={expandedId}
                                            onToggleExpand={setExpandedId}
                                            showActions={false}
                                            onPublishToNews={handlePublishPublicationToNews}
                                            searchQuery={filters.search?.trim() || ''}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                                    <p className="text-ncsu-gray/80 text-lg">
                                        {publications.length === 0
                                            ? 'No publications found for your profile yet.'
                                            : 'No publications match your filters.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Saved Posts */}
                    {section === 'saved' && (
                        <div>
                            {filteredSavedPosts.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4 w-full">
                                    {filteredSavedPosts.map((item) => (
                                        <NewsCard
                                            key={item.id}
                                            item={item}
                                            expanded={expandedId}
                                            onToggleExpand={setExpandedId}
                                            showActions={false}
                                            searchQuery={filters.search?.trim() || ''}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                                    <p className="text-ncsu-gray/80 text-lg">
                                        {savedPosts.length === 0
                                            ? 'No saved posts yet. Save posts from All News to see them here.'
                                            : 'No saved posts match your filters.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Drafts */}
                    {section === 'drafts' && (
                        <div>
                            {filteredDrafts.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4 w-full">
                                    {filteredDrafts.map((item) => (
                                        <div key={item.id} className="bg-white rounded-lg border border-gray-200 shadow-md p-5">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-slab font-bold text-ncsu-gray mb-2">
                                                        {item.title || '(Untitled Draft)'}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mb-2">
                                                        Last updated: {new Date(item.updated_at).toLocaleDateString()}
                                                    </p>
                                                    {item.content && (
                                                        <div className="text-sm text-gray-700 line-clamp-3 mb-3">
                                                            {item.content.replace(/<[^>]*>/g, '').substring(0, 200)}
                                                            {item.content.length > 200 ? '...' : ''}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditDraft(item)}
                                                    className="px-4 py-2 bg-ncsu-red text-white rounded text-sm font-medium hover:opacity-90"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handlePublishDraft(item.id)}
                                                    className="px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:opacity-90"
                                                >
                                                    Publish
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteDraft(item.id)}
                                                    className="px-4 py-2 bg-ncsu-gray text-white rounded text-sm font-medium hover:opacity-90"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                                    <p className="text-ncsu-gray/80 text-lg">
                                        {drafts.length === 0
                                            ? 'No drafts yet. Start writing an article to save drafts.'
                                            : 'No drafts match your filters.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    </div>
                </div>
            </div>

        </div>
    )
}