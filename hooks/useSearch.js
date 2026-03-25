'use client';
import { useState, useCallback, useEffect } from 'react';

export function useSearch() {
  const [query, setQuery] = useState('');           // input value (live)
  const [activeQuery, setActiveQuery] = useState(''); // last submitted query
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    sort: 'relevance',
  });

  const [page, setPage] = useState(1);

  const doSearch = useCallback(async (q, f, p) => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (q)          params.set('q', q);
    params.set('page',  String(p || 1));
    params.set('limit', '20');
    if (f.dateFrom) params.set('dateFrom', f.dateFrom);
    if (f.dateTo)   params.set('dateTo',   f.dateTo);
    if (f.sort)     params.set('sort',     f.sort);

    try {
      const res  = await fetch(`/api/documents/search?${params}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Search failed');
      setResults(data.results);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Submit on Enter — runs search with whatever is in the input right now
  function submitSearch() {
    const q = query.trim();
    setActiveQuery(q);
    setPage(1);
    if (q) {
      doSearch(q, filters, 1);
    } else {
      setResults([]);
      setPagination(null);
    }
  }

  // Clear button — wipes input and results
  function clearSearch() {
    setQuery('');
    setActiveQuery('');
    setResults([]);
    setPagination(null);
  }

  // When the input is manually cleared, wipe results immediately
  useEffect(() => {
    if (!query) {
      setActiveQuery('');
      setResults([]);
      setPagination(null);
    }
  }, [query]);

  // Re-search when filters change, but only if there is an active query
  useEffect(() => {
    if (activeQuery) {
      setPage(1);
      doSearch(activeQuery, filters, 1);
    }
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-search when paginating
  useEffect(() => {
    if (activeQuery) doSearch(activeQuery, filters, page);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const goToPage = useCallback((p) => setPage(p), []);

  return {
    query, setQuery,
    activeQuery,
    submitSearch, clearSearch,
    results, pagination, loading, error,
    filters, updateFilter,
    page, goToPage,
  };
}
