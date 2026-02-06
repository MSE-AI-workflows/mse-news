function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
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

export default function NewsCard({
  item,
  expanded,
  onToggleExpand,
  showActions = false,
  onEdit,
  onDelete,
  searchQuery = ''
}) {
  const isExpanded = expanded === item.id;

  const handleClick = () => {
    onToggleExpand?.(isExpanded ? null : item.id);
  };

  return (
    <article
      onClick={handleClick}
      className="group flex flex-col min-h-0 bg-white rounded-lg overflow-hidden border border-gray-200 shadow-md cursor-pointer transition-all duration-200 hover:shadow-xl hover:border-ncsu-red/40 hover:scale-[1.02]"
    >
      {/* Red title band */}
      <div className="bg-ncsu-red text-white px-5 py-4 flex-shrink-0">
        <h3 className="text-lg font-slab font-bold line-clamp-2">
          {searchQuery ? highlightText(item.title, searchQuery) : item.title }
        </h3>
      </div>

      {/* Images */}
      {Array.isArray(item.image_urls) && item.image_urls.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar p-2 border-b border-gray-100">
          {item.image_urls.map((url, i) => (
            <img key={i} src={url} alt="" className="h-40 w-auto min-w-[120px] object-cover rounded" onClick={(e) => e.stopPropagation()} />
          ))}
        </div>
      )}

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col min-h-[180px]">
        {(item.author_name || item.created_at) && (
          <p className="text-xs text-gray-500 mb-2">
            {item.author_name && <span className="font-medium text-ncsu-gray">{item.author_name}</span>}
            {item.author_name && item.created_at && ' · '}
            {item.created_at && formatDate(item.created_at)}
          </p>
        )}
        {item.author_email && (
          <p className="text-xs text-gray-400 mb-2">{item.author_email}</p>
        )}
        <p
          className={`text-gray-700 text-sm leading-relaxed flex-1 min-h-0 ${
            isExpanded ? '' : 'line-clamp-4'
          }`}
        >
          {searchQuery ? highlightText(item.content, searchQuery) : item.content }
        </p>

        {Array.isArray(item.hashtags) && item.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {item.hashtags.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 rounded text-xs font-medium bg-ncsu-red/10 text-ncsu-red">
                #{searchQuery ? highlightText(tag, searchQuery) : tag }
              </span>
            ))}
          </div>
        )}

        {Array.isArray(item.external_links) && item.external_links.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {item.external_links.map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-ncsu-red hover:underline" onClick={(e) => e.stopPropagation()}>
                {link.label || link.url}
              </a>
            ))}
          </div>
        )}

        {!isExpanded && (
          <div
            className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-ncsu-red text-sm font-semibold hover:underline">Read more →</p>
            {showActions && (onEdit || onDelete) && (
              <div className="flex gap-2">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="bg-ncsu-red text-white px-3 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="bg-ncsu-gray text-white px-3 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {isExpanded && (
          <div
            className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs text-gray-500">Tap to collapse</p>
            {showActions && (onEdit || onDelete) && (
              <div className="flex gap-2">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="bg-ncsu-red text-white px-3 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="bg-ncsu-gray text-white px-3 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
