import { Bookmark } from 'lucide-react';
import DOMPurify from 'dompurify';

const ALLOWED_HTML_TAGS = [
  'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's',
  'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
  'a', 'img', 'h1', 'h2', 'h3', 'span', 'div',
];

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
}

function highlightText(text, query) {
  if (!query || !text || typeof text !== 'string') return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = String(text).split(regex);
  return parts.map((part, i) => {
    const lowerPart = part.toLowerCase();
    const lowerQuery = query.toLowerCase();
    return lowerPart === lowerQuery ? (
      <mark key={i} className="bg-yellow-200 text-gray-900 rounded px-0.5">{part}</mark>
    ) : (
      part
    );
  });
}

function isHtmlContent(str) {
  if (!str || typeof str !== 'string') return false;
  return /<[a-z][\s\S]*>/i.test(str);
}

function renderContent(content, searchQuery) {
  if (!content) return null;
  if (isHtmlContent(content)) {
    const sanitized = DOMPurify.sanitize(content, { ALLOWED_TAGS: ALLOWED_HTML_TAGS, ALLOWED_ATTR: ['href', 'src', 'alt', 'target', 'rel'] });
    return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
  }
  return searchQuery ? highlightText(content, searchQuery) : content;
}

export default function NewsCard({
  item,
  expanded,
  onToggleExpand,
  showActions = false,
  onEdit,
  onDelete,
  searchQuery = '',
  isSaved = false,
  onToggleSave,
}) {
  const isExpanded = expanded === item.id;

  const handleSaveClick = (e) => {
    e.stopPropagation();
    onToggleSave?.(item.id);
  };

  const handleClick = () => {
    onToggleExpand?.(isExpanded ? null : item.id);
  };

  return (
    <article
      onClick={handleClick}
      className="group flex flex-col min-h-0 bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm cursor-pointer transition-shadow duration-200 hover:shadow-md hover:border-ncsu-red/40"
    >
      {/* Header: avatar + author + timestamp */}
      <div className="flex items-start justify-between px-4 pt-4 pb-2">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-ncsu-gray text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
            {getInitials(item.author_name || item.author_email || 'U')}
          </div>
          <div className="flex-1 min-w-0">
            {(item.author_name || item.author_email) && (
              <div className="flex items-center gap-2">
                {item.author_name && (
                  <span className="font-semibold text-gray-900 text-sm truncate">
                    {item.author_name}
                  </span>
                )}
                {item.author_email && (
                  <span className="text-xs text-gray-500 truncate">
                    {item.author_email}
                  </span>
                )}
              </div>
            )}
            {item.created_at && (
              <p className="text-xs text-gray-500 mt-0.5">
                {formatDate(item.created_at)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Title (optional, below header) */}
      {item.title && (
        <div className="px-4 pb-2">
          <h3 className="text-base md:text-lg font-bold text-gray-900">
            {searchQuery ? highlightText(item.title, searchQuery) : item.title}
          </h3>
        </div>
      )}

      {/* Content */}
      {item.content && (
        <div className="px-4 pb-3">
          <div
            className={`text-gray-700 text-sm leading-relaxed [&_a]:text-ncsu-red [&_a]:hover:underline [&_p]:mb-2 [&_p:last-child]:mb-0 ${
              isExpanded ? '' : 'line-clamp-4'
            }`}
          >
            {renderContent(item.content, searchQuery)}
          </div>
        </div>
      )}

      {/* Images */}
      {Array.isArray(item.image_urls) && item.image_urls.length > 0 && (
        <div className="px-4 pb-3">
          {item.image_urls.length === 1 ? (
            <img
              src={item.image_urls[0]}
              alt=""
              className="w-full rounded-lg object-cover"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {item.image_urls.slice(0, 4).map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  className="w-full h-40 object-cover rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hashtags & External Links */}
      {(Array.isArray(item.hashtags) && item.hashtags.length > 0) ||
      (Array.isArray(item.external_links) && item.external_links.length > 0) ? (
        <div className="px-4 pb-3 space-y-2">
          {Array.isArray(item.hashtags) && item.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.hashtags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded text-xs font-medium bg-ncsu-red/10 text-ncsu-red"
                >
                  #{searchQuery ? highlightText(tag, searchQuery) : tag}
                </span>
              ))}
            </div>
          )}

          {Array.isArray(item.external_links) && item.external_links.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.external_links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-ncsu-red hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {link.label || link.url}
                </a>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Bottom action bar */}
      <div
        className="px-4 py-3 border-t border-gray-200 flex items-center justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          {onToggleSave && (
            <button
              type="button"
              onClick={handleSaveClick}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
              title={isSaved ? 'Unsave' : 'Save'}
            >
              <Bookmark
                size={18}
                className={isSaved ? 'fill-ncsu-red text-ncsu-red' : 'text-gray-500'}
              />
              <span className="text-xs font-medium text-gray-600">
                {isSaved ? 'Saved' : 'Save'}
              </span>
            </button>
          )}
        </div>

        {showActions && (onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(item)}
                className="bg-ncsu-red text-white px-3 py-2 rounded text-xs md:text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="bg-ncsu-gray text-white px-3 py-2 rounded text-xs md:text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
