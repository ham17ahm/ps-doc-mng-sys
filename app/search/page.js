'use client';
import { useSearch } from '@/hooks/useSearch';
import SearchBar from '@/components/search/SearchBar';
import SearchFilters from '@/components/search/SearchFilters';
import ResultCard from '@/components/search/ResultCard';
import Pagination from '@/components/ui/Pagination';
import Spinner from '@/components/ui/Spinner';

export default function SearchPage() {
  const {
    query, setQuery,
    activeQuery,
    submitSearch, clearSearch,
    results, pagination, loading, error,
    filters, updateFilter,
    page, goToPage,
  } = useSearch();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Search Documents</h1>
        <p className="text-gray-500 mt-1">
          Natural language search across all extracted document content.
        </p>
      </div>

      {/* Search bar */}
      <SearchBar
        value={query}
        onChange={setQuery}
        onSubmit={submitSearch}
        onClear={clearSearch}
        loading={loading}
      />

      {/* Filters row */}
      <div className="mt-4 mb-6">
        <SearchFilters filters={filters} onUpdate={updateFilter} />
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 mb-4">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && results.length === 0 && (
        <div className="flex justify-center py-20">
          <Spinner size="lg" className="text-blue-500" />
        </div>
      )}

      {/* Results count */}
      {!loading && activeQuery && pagination && (
        <p className="text-sm text-gray-500 mb-4">
          {pagination.total === 0 ? (
            'No documents found'
          ) : (
            <>
              <span className="font-medium text-gray-900">{pagination.total}</span>{' '}
              {pagination.total === 1 ? 'document' : 'documents'}
              {' '}for &ldquo;<span className="font-medium">{activeQuery}</span>&rdquo;
            </>
          )}
        </p>
      )}

      {/* Empty / prompt state */}
      {!loading && !error && results.length === 0 && (
        <div className="text-center py-16">
          {activeQuery ? (
            <>
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-semibold text-gray-700 mb-1">No results found</h3>
              <p className="text-sm text-gray-500">Try different keywords or remove some filters.</p>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-semibold text-gray-700 mb-1">Search your documents</h3>
              <p className="text-sm text-gray-500">Type a keyword above and press Enter.</p>
            </>
          )}
        </div>
      )}

      {/* Results list */}
      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((doc) => (
            <ResultCard key={doc.id || doc._id} doc={doc} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination pagination={pagination} onPageChange={goToPage} />
    </div>
  );
}
