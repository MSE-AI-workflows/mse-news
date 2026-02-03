import { useState, useEffect } from 'react';
import api from '../api/client';

export default function AllNewsPage() {
  const [news, setNews] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">List All News</h1>

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

                <p className="text-xs text-gray-500 mb-2">
                  <span className="font-medium">{item.author_name}</span> • {formatDate(item.created_at)}
                </p>
                <p className="text-xs text-gray-400 mb-3">
                  {item.author_email}
                </p>

                <p className={`text-gray-700 text-sm leading-relaxed ${
                  expandedId === item.id ? '' : 'line-clamp-3'
                }`}>
                  {item.content}
                </p>

                {expandedId === item.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Tap to collapse
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {news.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No news items yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}