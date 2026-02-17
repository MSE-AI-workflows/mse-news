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
  const [imageUrls, setImageUrls] = useState([]);
  const [externalLinks, setExternalLinks] = useState([{ label: '', url: '' }]);
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
        setImageUrls(Array.isArray(draft.image_urls) && draft.image_urls.length > 0 ? draft.image_urls : []);
        setExternalLinks(Array.isArray(draft.external_links) && draft.external_links.length > 0 ? draft.external_links : [{ label: '', url: '' }]);
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

  const handleFileUpload = async (files) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    try {
      const uploadedUrls = [];

      for (const file of fileArray) {
        const formData = new FormData();
        formData.append('image', file);

        const res = await api.post('/uploads/images', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (res.data && res.data.url) {
          // api.defaults.baseURL is like http://localhost:4000/api
          const apiBase = api.defaults.baseURL || '';
          const backendOrigin = apiBase.replace(/\/api\/?$/, '');
          const fullUrl = `${backendOrigin}${res.data.url}`;
          uploadedUrls.push(fullUrl);
        }
      }

      if (uploadedUrls.length > 0) {
        setImageUrls((prev) => [...prev, ...uploadedUrls]);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload one or more images. Please try again.');
    }
  };

  const addImageUrl = () => setImageUrls([...imageUrls, '']);
  const updateImageUrl = (i, v) => {
    const next = [...imageUrls];
    next[i] = v;
    setImageUrls(next);
  };
  const removeImageUrl = (i) => {
    const next = imageUrls.filter((_, idx) => idx !== i);
    setImageUrls(next);
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
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="w-full flex items-center justify-between">
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

      {/* Main Content - Two Column Layout */}
      <main className="w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-6">
          {/* Left Column (30%) - Metadata Fields */}
          <aside className="space-y-6">
            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
              
              {/* Upload multiple images button */}
              <div className="mb-3">
                <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-ncsu-red transition-colors">
                  <ImageIcon size={18} className="text-gray-500" />
                  <span className="text-sm text-gray-700">Upload images</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileUpload(e.target.files);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Image list */}
              {imageUrls.length > 0 && imageUrls.map((url, i) => (
                <div key={i} className="mb-3">
                  {url && (url.startsWith('data:') || url.startsWith('http') || url.startsWith('/uploads/')) ? (
                    <div className="relative mb-2">
                      <img src={url} alt={`Preview ${i + 1}`} className="w-full h-32 object-cover rounded-lg border border-gray-200" />
                      <button
                        type="button"
                        onClick={() => removeImageUrl(i)}
                        className="absolute top-2 right-2 px-2 py-1 bg-black/50 text-white rounded text-xs hover:bg-black/70"
                      >
                        ×
                      </button>
                    </div>
                  ) : null}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={url && !url.startsWith('data:') ? url : ''}
                      onChange={(e) => updateImageUrl(i, e.target.value)}
                      placeholder={`Image ${i + 1} URL`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red"
                    />
                    <button
                      type="button"
                      onClick={() => removeImageUrl(i)}
                      className="px-2 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addImageUrl}
                className="text-xs text-ncsu-red hover:underline mt-1"
              >
                + Add image URL
              </button>
            </div>

            {/* LinkedIn Import */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Import from LinkedIn
              </label>
              <div className="flex flex-col gap-2">
                <input
                  type="url"
                  value={linkedInUrl}
                  onChange={(e) => setLinkedInUrl(e.target.value)}
                  placeholder="Paste LinkedIn post URL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red"
                />
                <button
                  type="button"
                  onClick={handleImportFromLinkedIn}
                  disabled={!linkedInUrl || isFetchingLinkedIn}
                  className="w-full px-4 py-2 bg-ncsu-red text-white rounded-md text-sm disabled:opacity-50"
                >
                  {isFetchingLinkedIn ? 'Fetching…' : 'Fetch details'}
                </button>
              </div>
              {linkedInError && <p className="mt-1 text-xs text-red-600">{linkedInError}</p>}
            </div>

            {/* Hashtags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hashtags</label>
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="research, materials, engineering"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red"
              />
              <p className="mt-1 text-xs text-gray-500">Comma-separated</p>
            </div>

            {/* External Links */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">External Links</label>
              {externalLinks.map((link, i) => (
                <div key={i} className="mb-2 p-2 border border-gray-200 rounded-md">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => updateExternalLink(i, 'label', e.target.value)}
                    placeholder="Link label"
                    className="w-full px-3 py-1.5 mb-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red"
                  />
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateExternalLink(i, 'url', e.target.value)}
                      placeholder="https://example.com"
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red"
                    />
                    {externalLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExternalLink(i)}
                        className="px-2 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addExternalLink}
                className="text-xs text-ncsu-red hover:underline mt-1"
              >
                + Add link
              </button>
            </div>
          </aside>

          {/* Right Column (70%) - Title and Content */}
          <div className="space-y-6">
            {/* Title Input */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full text-3xl md:text-4xl font-slab font-bold text-gray-900 placeholder-gray-400 border-none focus:outline-none"
              />
            </div>

            {/* Content Editor */}
            <div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write here..."
                className="w-full min-h-[500px] text-base md:text-lg text-gray-700 placeholder-gray-400 border-none focus:outline-none resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>
       
      </main>
    </div>
  );
}
