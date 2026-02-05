function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function NewsCard({
  item,
  expanded,
  onToggleExpand,
  showActions = false,
  onEdit,
  onDelete,
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
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-lg font-slab font-bold line-clamp-2 flex-1 min-w-0">
            {item.title}
          </h3>
          <span
            className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
              item.status === 'published'
                ? 'bg-white/20 text-white'
                : 'bg-white/10 text-white/90'
            }`}
          >
            {item.status}
          </span>
        </div>
      </div>

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
          {item.content}
        </p>

        {!isExpanded && (
          <p className="mt-3 text-ncsu-red text-sm font-semibold hover:underline">
            Read more →
          </p>
        )}

        {showActions && isExpanded && (onEdit || onDelete) && (
          <div
            className="mt-4 pt-4 border-t border-gray-200 flex gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(item)}
                className="flex-1 bg-ncsu-red text-white px-3 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="flex-1 bg-ncsu-gray text-white px-3 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Delete
              </button>
            )}
          </div>
        )}

        {!showActions && isExpanded && (
          <p className="mt-4 text-xs text-gray-500">Tap to collapse</p>
        )}
      </div>
    </article>
  );
}
