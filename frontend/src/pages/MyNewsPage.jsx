import { useState, useEffect } from 'react';
import api from '../api/client';

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">List of my news</h1>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {item.title}
                  </h3>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                    item.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
                
                <p className="text-xs text-gray-500 mb-3">
                  {formatDate(item.created_at)}
                </p>

                <p className={`text-gray-700 text-sm leading-relaxed ${
                  expandedId === item.id ? '' : 'line-clamp-3'
                }`}>
                  {item.content}
                </p>

                {expandedId === item.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(item);
                      }}
                      className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {news.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No news items yet. Click "Add your News" to get started!</p>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={openCreateModal}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 z-50"
      >
        <span className="text-lg font-medium">+</span>
        <span className="font-semibold">Add your News</span>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-md h-40 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
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
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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