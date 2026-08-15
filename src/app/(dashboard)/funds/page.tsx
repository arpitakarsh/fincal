'use client';

import React, { useEffect, useState, useCallback, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, Filter, ChevronLeft, ChevronRight, TrendingUp, 
  TrendingDown, Info, Loader2, Sparkles, AlertTriangle 
} from 'lucide-react';

interface Fund {
  id: string; // schemeCode
  name: string;
  category: string;
  amc: { name: string };
  metrics?: { cagr1Y?: number };
}

interface FundsResponse {
  data: Fund[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const CATEGORIES = [
  'Equity', 'Debt', 'Hybrid', 'Liquid', 'ELSS', 'Index'
];

function FundsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state
  const initialSearch = searchParams?.get('search') || '';
  const initialCategory = searchParams?.get('category') || '';
  const initialPage = parseInt(searchParams?.get('page') || '1', 10);

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  
  const [category, setCategory] = useState(initialCategory);
  const [page, setPage] = useState(initialPage);
  
  // Data state
  const [data, setData] = useState<FundsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFetchingBackground, setIsFetchingBackground] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const hasFetchedOnce = useRef(false);

  useEffect(() => {
    let mounted = true;
    
    const loadFunds = async () => {
      try {
        // We only set loading state inside the async function AFTER evaluating our conditions,
        // but ESLint allows it here because it's inside an async function defined in the effect.
        if (!hasFetchedOnce.current) setLoading(true);
        else setIsFetchingBackground(true);
        hasFetchedOnce.current = true;
        
        const query = new URLSearchParams();
        if (debouncedSearch) query.set('search', debouncedSearch);
        if (category && category !== 'All') query.set('category', category);
        query.set('page', page.toString());
        query.set('limit', '20');

        // Update URL silently
        router.replace(`/funds?${query.toString()}`, { scroll: false });

        const res = await fetch(`/api/funds?${query.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch funds');
        
        const json = await res.json();
        if (mounted) {
          setData({ data: json.data, meta: json.meta || { total: 0, page: 1, limit: 20, totalPages: 1 } });
          setError(null);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message);
          setData(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setIsFetchingBackground(false);
        }
      }
    };

    loadFunds();
    return () => { mounted = false; };
  }, [debouncedSearch, category, page, router]);

  const handleCategoryClick = (cat: string) => {
    if (category === cat) {
      setCategory('');
    } else {
      setCategory(cat);
      setPage(1);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (data && newPage > data.meta.totalPages)) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 relative pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Explore Mutual Funds</h1>
        <p className="text-sm text-gray-500 mt-1">Search, compare, and analyze mutual funds.</p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sticky top-4 z-10 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search funds or AMCs..."
            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
          {isFetchingBackground && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            </div>
          )}
        </div>
        
        <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <button 
            onClick={() => handleCategoryClick('')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              category === '' 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                category === cat 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          {error}
        </div>
      ) : loading && !data ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Funds Found</h2>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            We couldn't find any mutual funds matching your search criteria. Try adjusting your filters.
          </p>
          <button 
            onClick={() => { setSearchTerm(''); setCategory(''); }}
            className="inline-flex items-center px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-opacity duration-200" style={{ opacity: isFetchingBackground ? 0.7 : 1 }}>
            
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Fund Name</th>
                    <th className="px-6 py-4">AMC</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-right">Current NAV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.data.map((fund) => {
                    const nav = fund.metrics?.cagr1Y;
                    return (
                      <tr 
                        key={fund.id} 
                        className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/funds/${fund.id}`)}
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">{fund.name}</div>
                          <div className="text-xs text-gray-500 font-mono mt-0.5">Code: {fund.id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700">{fund.amc?.name || 'Unknown AMC'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {fund.category || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-sm font-bold text-gray-900">
                            {nav ? `₹${nav.toFixed(2)}` : 'N/A'}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {data?.data.map((fund) => (
                <div 
                  key={fund.id} 
                  className="p-4 space-y-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100"
                  onClick={() => router.push(`/funds/${fund.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <h3 className="text-sm font-bold text-gray-900">{fund.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{fund.amc?.name || 'Unknown AMC'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {fund.metrics?.cagr1Y ? `₹${fund.metrics.cagr1Y.toFixed(2)}` : 'N/A'}
                      </p>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-1">NAV</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {fund.category || 'N/A'}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">#{fund.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {data && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-100 rounded-xl shadow-sm">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= data.meta.totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((page - 1) * data.meta.limit) + 1}</span> to <span className="font-medium">{Math.min(page * data.meta.limit, data.meta.total)}</span> of{' '}
                    <span className="font-medium">{data.meta.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 focus:z-20 focus:outline-offset-0"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    
                    {/* Simple page numbers */}
                    {[...Array(Math.min(5, data.meta.totalPages))].map((_, i) => {
                      // Calculate which pages to show
                      let p = page;
                      if (page < 3) p = i + 1;
                      else if (page > data.meta.totalPages - 2) p = data.meta.totalPages - 4 + i;
                      else p = page - 2 + i;

                      if (p < 1 || p > data.meta.totalPages) return null;

                      return (
                        <button
                          key={p}
                          onClick={() => handlePageChange(p)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${
                            p === page 
                              ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600' 
                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= data.meta.totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 focus:z-20 focus:outline-offset-0"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function FundsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    }>
      <FundsContent />
    </Suspense>
  );
}
