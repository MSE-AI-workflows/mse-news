import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import api from '../api/client';

export default function WriteArticlePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get('draft');
  const editDraftId = searchParams.get('edit');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [imageUrls, setImageUrls] = useState(['']);
  const [externalLinks, setExternalLinks] = useState([{ label: '', url: '' }]);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [isFetchingLinkedIn, setIsFetchingLinkedIn] = useState(false);
  const [linkedInError, setLinkedInError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showManageMenu, setShowManageMenu] = useState(false);

  useEffect(() => {
    if (editDraftId) {
      fetchDraft(editDraftId);
    }
  }, [editDraftId]);

  const fetchDraft = async (id) => {
    try {
      const res = await api.get('/drafts/my');
      const draft = res.data.find((d) => d.id === parseInt(id));
      if (draft) {
        setTitle(draft.title || '');
        setContent(draft.content || '');
        setHashtags(Array.isArray(draft.hashtags) ? draft.hashtags.join(', ') : '');
        setImageUrls(Array.isArray(draft.image_urls) && draft.image_urls.length > 0 ? draft.image_urls : ['']);
        setExternalLinks(Array.isArray(draft.external_links) && draft.external_links.length > 0 ? draft.external_links : [{ label: '', url: '' }]);
        setCoverImageUrl(Array.isArray(draft.image_urls) && draft.image_urls.length > 0 ? draft.image_urls[0] : '');
      }
    } catch (error) {
      console.error('Error fetching draft:', error);
    }
  };

  const handleImportFromLinkedIn = async () => {
    if (!linkedInUrl.trim()) return;

    try {
      setIsFetchingLinkedIn(true);
      setLinkedInError('');

      const res = await api.post('/link-preview/fetch-linkedin-post', {
        url: linkedInUrl.trim(),
      });

      const data = res.data;

      if (data.content) {
        setContent(data.content);
      }

      if (Array.isArray(data.hashtags) && data.hashtags.length > 0) {
        setHashtags(data.hashtags.join(', '));
      }

      if (Array.isArray(data.image_urls) && data.image_urls.length > 0) {
        setImageUrls(data.image_urls);
        setCoverImageUrl(data.image_urls[0] || '');
      }

      if (Array.isArray(data.external_links) && data.external_links.length > 0) {
        setExternalLinks(data.external_links);
      }
    } catch (err) {
      console.error('Error importing from LinkedIn:', err);
      setLinkedInError('Could not fetch details from that LinkedIn URL.');
    } finally {
      setIsFetchingLinkedIn(false);
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const hashtagsArray = hashtags.split(',').map((t) => t.trim()).filter(Boolean);
      const imageUrlsArray = imageUrls.filter((u) => u.trim().length > 0);
      const externalLinksArray = externalLinks
        .filter((l) => l.label.trim() && l.url.trim())
        .map((l) => ({ label: l.label.trim(), url: l.url.trim() }));

      const payload = {
        title: title || null,
        content: content || '',
        hashtags: hashtagsArray,
        image_urls: imageUrlsArray,
        external_links: externalLinksArray,
      };

      if (editDraftId) {
        await api.put(`/drafts/${editDraftId}`, payload);
      } else {
        await api.post('/drafts', payload);
      }

      navigate('/dashboard/all-news');
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!title.trim() || !hasContent) {
      alert('Title and content are required to publish.');
      return;
    }

    setLoading(true);
    try {
      const hashtagsArray = hashtags.split(',').map((t) => t.trim()).filter(Boolean);
      const imageUrlsArray = imageUrls.filter((u) => u.trim().length > 0);
      const externalLinksArray = externalLinks
        .filter((l) => l.label.trim() && l.url.trim())
        .map((l) => ({ label: l.label.trim(), url: l.url.trim() }));

      if (editDraftId) {
        await api.post(`/drafts/${editDraftId}/publish`);
      } else {
        const payload = {
          title,
          content,
          hashtags: hashtagsArray,
          image_urls: imageUrlsArray,
          external_links: externalLinksArray,
        };
        await api.post('/news/my', payload);
      }

      navigate('/dashboard/all-news');
    } catch (error) {
      console.error('Error publishing:', error);
    } finally {
      setLoading(false);
    }
  };

  const addImageUrl = () => setImageUrls([...imageUrls, '']);
  const updateImageUrl = (i, v) => {
    const next = [...imageUrls];
    next[i] = v;
    setImageUrls(next);
    if (i === 0) setCoverImageUrl(v);
  };
  const removeImageUrl = (i) => {
    const next = imageUrls.filter((_, idx) => idx !== i);
    setImageUrls(next.length > 0 ? next : ['']);
    if (i === 0) setCoverImageUrl(next[0] || '');
  };

  const addExternalLink = () => setExternalLinks([...externalLinks, { label: '', url: '' }]);
  const updateExternalLink = (i, field, v) => {
    const next = [...externalLinks];
    next[i] = { ...next[i], [field]: v };
    setExternalLinks(next);
  };
  const removeExternalLink = (i) =>
    setExternalLinks(externalLinks.length > 1 ? externalLinks.filter((_, idx) => idx !== i) : [{ label: '', url: '' }]);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const hasContent = Boolean(content && content.trim());

  return (
    <div className="min-h-screen bg-white">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-ncsu-gray text-white flex items-center justify-center text-sm font-bold">
                {user ? getInitials(user.name) : 'U'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">Individual article</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
                  <button
                    onClick={() => {
                      handleSaveDraft();
                      setShowManageMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Save as draft
                  </button>
            
            </div>
            <button
              onClick={handlePublish}
              disabled={loading || !title.trim() || !hasContent}
              className="px-6 py-2 bg-ncsu-red text-white rounded-full text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Publishing...' : 'Publish'}
              <span>→</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Cover Image Upload Area */}
        <div className="mb-8">
          <div className="w-full h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-ncsu-red transition-colors">
            {coverImageUrl ? (
              <div className="relative w-full h-full">
                <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover rounded-lg" />
                <button
                  onClick={() => {
                    setCoverImageUrl('');
                    if (imageUrls[0] === coverImageUrl) {
                      const next = [...imageUrls];
                      next[0] = '';
                      setImageUrls(next);
                    }
                  }}
                  className="absolute top-2 right-2 px-3 py-1 bg-black/50 text-white rounded text-sm hover:bg-black/70"
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <ImageIcon size={48} className="text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm mb-1">Add a cover image or video to your article</p>
                <button
                  onClick={() => document.getElementById('cover-upload')?.click()}
                  className="mt-2 px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
                >
                  Upload from computer
                </button>
                <input
                  id="cover-upload"
                  type="url"
                  placeholder="Or paste image URL"
                  value={coverImageUrl}
                  onChange={(e) => {
                    setCoverImageUrl(e.target.value);
                    if (imageUrls[0] !== e.target.value) {
                      const next = [...imageUrls];
                      next[0] = e.target.value;
                      setImageUrls(next);
                    }
                  }}
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red"
                />
              </>
            )}
          </div>
        </div>

        {/* Title Input */}
        <div className="mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full text-4xl font-slab font-bold text-gray-900 placeholder-gray-400 border-none focus:outline-none"
          />
        </div>

        {/* Content Editor - plain textarea (react-quill has React 19 compatibility issues) */}
        <div className="mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write here. You can also include @mentions."
            className="w-full min-h-[400px] text-lg text-gray-700 placeholder-gray-400 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ncsu-red focus:border-transparent resize-y"
          />
        </div>

        {/* LinkedIn Import */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Import from LinkedIn (optional)
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="url"
              value={linkedInUrl}
              onChange={(e) => setLinkedInUrl(e.target.value)}
              placeholder="Paste LinkedIn post URL"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ncsu-red"
            />
            <button
              type="button"
              onClick={handleImportFromLinkedIn}
              disabled={!linkedInUrl || isFetchingLinkedIn}
              className="px-4 py-2 bg-ncsu-red text-white rounded-md text-sm disabled:opacity-50"
            >
              {isFetchingLinkedIn ? 'Fetching…' : 'Fetch details'}
            </button>
          </div>
          {linkedInError && <p className="mt-1 text-xs text-red-600">{linkedInError}</p>}
        </div>

        {/* Hashtags */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Hashtags (comma-separated)</label>
          <input
            type="text"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            placeholder="e.g. research, materials, engineering"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ncsu-red"
          />
        </div>

        {/* Additional Image URLs */}
        {imageUrls.length > 1 || (imageUrls.length === 1 && imageUrls[0]) ? (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Images</label>
            {imageUrls.slice(1).map((url, i) => (
              <div key={i + 1} className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => updateImageUrl(i + 1, e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ncsu-red"
                />
                <button
                  type="button"
                  onClick={() => removeImageUrl(i + 1)}
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addImageUrl}
              className="text-sm text-ncsu-red hover:underline"
            >
              + Add image URL
            </button>
          </div>
        ) : null}

        {/* External Links */}
        {externalLinks.length > 0 && externalLinks.some((l) => l.label || l.url) ? (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">External Links</label>
            {externalLinks.map((link, i) => (
              <div key={i} className="mb-3 p-3 border border-gray-200 rounded-md">
                <div className="flex gap-2">
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
                    <button
                      type="button"
                      onClick={() => removeExternalLink(i)}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addExternalLink}
              className="text-sm text-ncsu-red hover:underline"
            >
              + Add link
            </button>
          </div>
        ) : null}

        {/* Draft indicator */}
        <div className="fixed bottom-6 right-6">
          <div className="bg-gray-100 text-gray-600 text-xs px-3 py-2 rounded-full flex items-center gap-2">
            <span>Draft</span>
          </div>
        </div>
      </main>
    </div>
  );
}
