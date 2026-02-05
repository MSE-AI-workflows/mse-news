import { useState, useEffect } from 'react';
import api from '../api/client';
import NewsCard from '../components/NewsCard';

export default function MyNewsPage() {
  const [news, setNews] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await api.get('/news/my');
      setNews(res.data);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/news/my/${editingId}`, { title, content });
      } else {
        await api.post('/news/my', { title, content });
      }
      setTitle('');
      setContent('');
      setEditingId(null);
      setShowModal(false);
      fetchNews();
    } catch (error) {
      console.error('Error saving news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setTitle(item.title);
    setContent(item.content);
    setEditingId(item.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this news item?')) {
      return;
    }
    try {
      await api.delete(`/news/my/${id}`);
      fetchNews();
    } catch (error) {
      console.error('Error deleting news:', error);
    }
  };

  const openCreateModal = () => {
    setTitle('');
    setContent('');
    setEditingId(null);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2] font-sans pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-slab font-bold text-ncsu-gray mb-6 uppercase tracking-tight">List of my news</h1>

        {/* Single column feed */}
        <div className="grid grid-cols-1 gap-4 w-full max-w-3xl mx-auto">
          {news.map((item) => (
            <NewsCard
              key={item.id}
              item={item}
              expanded={expandedId}
              onToggleExpand={setExpandedId}
              showActions
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {news.length === 0 && (
          <div className="text-center py-16">
            <p className="text-ncsu-gray/80 text-lg font-sans">No news items yet. Click "Add your News" to get started!</p>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={openCreateModal}
        className="fixed bottom-6 right-6 bg-ncsu-red hover:opacity-90 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 z-50 font-bold uppercase text-sm tracking-wide"
      >
        <span className="text-lg font-medium">+</span>
        <span className="font-semibold">Add your News</span>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-slab font-bold mb-6 text-ncsu-gray uppercase tracking-tight">
                {editingId ? 'Edit News' : 'Add your News'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ncsu-red font-sans"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md h-40 focus:outline-none focus:ring-2 focus:ring-ncsu-red resize-y font-sans"
                    required
                  />
                </div>
                <div className="flex space-x-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setTitle('');
                      setContent('');
                      setEditingId(null);
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-ncsu-red text-white rounded-md font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    {editingId ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}