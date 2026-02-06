import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import NewsCard from '../components/NewsCard';

export default function ProfilePage() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [news, setNews] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [hashtags, setHashtags] = useState('');
    const [imageUrls, setImageUrls] = useState(['']);
    const [externalLinks, setExternalLinks] = useState([{ label: '', url: '' }]);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchNews = async () => {
        try {
            const res = await api.get('/news/my');
            setNews(res.data);
        } catch (error) {
            console.error('Error fetching news:', error);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    useEffect(() => {
        if (searchParams.get('add') === '1') {
            openCreateModal();
            setSearchParams({}, { replace: true });
        }
    }, [searchParams]);

    const resetForm = () => {
        setTitle('');
        setContent('');
        setHashtags('');
        setImageUrls(['']);
        setExternalLinks([{ label: '', url: '' }]);
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const hashtagsArray = hashtags.split(',').map((t) => t.trim()).filter(Boolean);
            const imageUrlsArray = imageUrls.filter((u) => u.trim().length > 0);
            const externalLinksArray = externalLinks
                .filter((l) => l.label.trim() && l.url.trim())
                .map((l) => ({ label: l.label.trim(), url: l.url.trim() }));

            const payload = { title, content, hashtags: hashtagsArray, image_urls: imageUrlsArray, external_links: externalLinksArray };
            if (editingId) {
                await api.put(`/news/my/${editingId}`, payload);
            } else {
                await api.post('/news/my', payload);
            }
            resetForm();
            setShowModal(false);
            fetchNews();
        } catch (error) {
            console.error('Error saving news:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setTitle(item.title || '');
        setContent(item.content || '');
        setHashtags(Array.isArray(item.hashtags) ? item.hashtags.join(', ') : '');
        setImageUrls(Array.isArray(item.image_urls) && item.image_urls.length > 0 ? item.image_urls : ['']);
        setExternalLinks(Array.isArray(item.external_links) && item.external_links.length > 0 ? item.external_links : [{ label: '', url: '' }]);
        setEditingId(item.id);
        setShowModal(true);
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

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const addImageUrl = () => setImageUrls([...imageUrls, '']);
    const updateImageUrl = (i, v) => {
        const next = [...imageUrls];
        next[i] = v;
        setImageUrls(next);
    };
    const removeImageUrl = (i) => setImageUrls(imageUrls.length > 1 ? imageUrls.filter((_, idx) => idx !== i) : ['']);

    const addExternalLink = () => setExternalLinks([...externalLinks, { label: '', url: '' }]);
    const updateExternalLink = (i, field, v) => {
        const next = [...externalLinks];
        next[i] = { ...next[i], [field]: v };
        setExternalLinks(next);
    };
    const removeExternalLink = (i) => setExternalLinks(externalLinks.length > 1 ? externalLinks.filter((_, idx) => idx !== i) : [{ label: '', url: '' }]);

    return (
        <div className="min-h-screen bg-[#f2f2f2] font-sans">
            <div className="flex-1 min-w-0 px-4 py-8">
                <h1 className="text-2xl font-slab font-bold text-ncsu-gray mb-6 uppercase tracking-tight">Profile</h1>

                <div className="max-w-3xl mx-auto space-y-8">
                    {/* Profile info card */}
                    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                        <p className="text-ncsu-gray font-sans"><strong className="font-slab">Name:</strong> {user?.name}</p>
                        <p className="text-ncsu-gray font-sans mt-2"><strong className="font-slab">Email:</strong> {user?.email}</p>
                    </div>

                    {/* My News feed */}
                    <div>
                        <h2 className="text-xl font-slab font-bold text-ncsu-gray mb-4 uppercase tracking-tight">My News</h2>
                        <div className="grid grid-cols-1 gap-4 w-full">
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
                                <p className="text-ncsu-gray/80 text-lg">No news items yet. Click "Upload News" at the top to get started!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ncsu-red font-sans"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md h-40 focus:outline-none focus:ring-2 focus:ring-ncsu-red resize-y font-sans"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Hashtags (comma-separated)</label>
                                    <input
                                        type="text"
                                        value={hashtags}
                                        onChange={(e) => setHashtags(e.target.value)}
                                        placeholder="e.g. research, materials, engineering"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ncsu-red font-sans"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Image URLs</label>
                                    {imageUrls.map((url, i) => (
                                        <div key={i} className="flex gap-2 mb-2">
                                            <input
                                                type="url"
                                                value={url}
                                                onChange={(e) => updateImageUrl(i, e.target.value)}
                                                placeholder="https://example.com/image.jpg"
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ncsu-red"
                                            />
                                            {imageUrls.length > 1 && (
                                                <button type="button" onClick={() => removeImageUrl(i)} className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm">Remove</button>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" onClick={addImageUrl} className="text-sm text-ncsu-red hover:underline">+ Add image URL</button>
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">External Links</label>
                                    {externalLinks.map((link, i) => (
                                        <div key={i} className="mb-3 p-3 border border-gray-200 rounded-md">
                                            <div className="flex gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    value={link.label}
                                                    onChange={(e) => updateExternalLink(i, 'label', e.target.value)}
                                                    placeholder="Link label"
                                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ncsu-red"
                                                />
                                                <input
                                                    type="url"
                                                    value={link.url}
                                                    onChange={(e) => updateExternalLink(i, 'url', e.target.value)}
                                                    placeholder="https://example.com"
                                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ncsu-red"
                                                />
                                                {externalLinks.length > 1 && (
                                                    <button type="button" onClick={() => removeExternalLink(i)} className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm">Remove</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <button type="button" onClick={addExternalLink} className="text-sm text-ncsu-red hover:underline">+ Add link</button>
                                </div>
                                <div className="flex space-x-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => { setShowModal(false); resetForm(); }}
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
    )
}