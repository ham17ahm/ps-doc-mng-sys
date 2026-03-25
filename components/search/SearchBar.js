'use client';

export default function SearchBar({ value, onChange, onSubmit, onClear, loading }) {
  function handleKeyDown(e) {
    if (e.key === 'Enter') onSubmit();
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
        {loading ? (
          <svg className="animate-spin w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
        ) : (
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search documents — press Enter to search"
        className="w-full rounded-xl border border-gray-300 pl-12 pr-12 py-3.5 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-3 flex items-center justify-center w-8 h-8 my-auto rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
}
