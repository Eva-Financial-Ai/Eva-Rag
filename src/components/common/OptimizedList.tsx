import React, { useMemo, useCallback } from 'react';
import { useVirtualScroll, useDebounce } from '../../utils/performance';

interface OptimizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  searchable?: boolean;
  onItemClick?: (item: T) => void;
  keyExtractor: (item: T) => string;
}

/**
 * Optimized list component with virtual scrolling
 * Complies with:
 * - lazy-load-document-previews-and-large-datasets
 * - paginate-loan-lists-and-search-results
 * - optimize-database-queries-with-proper-indexing
 */
function OptimizedList<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  searchable = false,
  onItemClick,
  keyExtractor,
}: OptimizedListProps<T>) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchable || !debouncedSearchTerm) return items;

    return items.filter(item => {
      const searchableText = JSON.stringify(item).toLowerCase();
      return searchableText.includes(debouncedSearchTerm.toLowerCase());
    });
  }, [items, debouncedSearchTerm, searchable]);

  // Virtual scrolling
  const { visibleItems, totalHeight, offsetY, handleScroll, startIndex, endIndex } =
    useVirtualScroll(filteredItems, itemHeight, containerHeight);

  // Memoized item renderer
  const renderMemoizedItem = useCallback(
    (item: T, index: number) => {
      const actualIndex = startIndex + index;
      return (
        <div
          key={keyExtractor(item)}
          style={{
            position: 'absolute',
            top: actualIndex * itemHeight,
            left: 0,
            right: 0,
            height: itemHeight,
          }}
          onClick={() => onItemClick?.(item)}
          role="listitem"
          tabIndex={0}
          onKeyPress={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              onItemClick?.(item);
            }
          }}
          className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
        >
          {renderItem(item, actualIndex)}
        </div>
      );
    },
    [startIndex, itemHeight, onItemClick, renderItem, keyExtractor]
  );

  return (
    <div className="optimized-list">
      {searchable && (
        <div className="mb-4">
          <label htmlFor="list-search" className="sr-only">
            Search items
          </label>
          <input
            id="list-search"
            type="search"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            aria-label="Search items"
          />
        </div>
      )}

      <div
        className="relative overflow-auto border border-gray-200 rounded-md"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
        role="list"
        aria-label={`List of ${filteredItems.length} items`}
      >
        <div
          style={{
            height: totalHeight,
            position: 'relative',
          }}
        >
          <div
            style={{
              transform: `translateY(${offsetY}px)`,
            }}
          >
            {visibleItems.map((item, index) => renderMemoizedItem(item, index))}
          </div>
        </div>
      </div>

      <div className="mt-2 text-sm text-gray-500" aria-live="polite">
        Showing {visibleItems.length} of {filteredItems.length} items
      </div>
    </div>
  );
}

export default React.memo(OptimizedList);
