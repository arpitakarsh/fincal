'use client';

import React, { useEffect, useState } from 'react';
import { X, Search, Loader2, AlertTriangle } from 'lucide-react';

export interface Holding {
  id?: string;
  schemeCode: string;
  fundName: string;
  amc?: string;
  category?: string;
  units: number;
  purchaseNav?: number;    // From EnrichedHolding
  averageNav?: number;     // Used internally / fallback
  investedValue?: number;
  investedAmount?: number;
  currentValue?: number;
  currentNav?: number;
  liveNav?: number;
  pnl?: number;
  pnlPercentage?: number;
  navUnavailable?: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

export function HoldingModal({ 
  isOpen, 
  holding, 
  onClose, 
  onSuccess,
  prefilledFund
}: { 
  isOpen: boolean; 
  holding: Holding | null; 
  onClose: () => void; 
  onSuccess: () => void;
  prefilledFund?: { id: string; name: string; category?: string };
}) {
  const [inputType, setInputType] = useState<'amount' | 'units'>('amount');
  const [amount, setAmount] = useState('');
  const [units, setUnits] = useState(holding ? holding.units.toString() : '');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedFund, setSelectedFund] = useState<any | null>(
    holding 
      ? { id: holding.schemeCode, name: holding.fundName } 
      : prefilledFund || null
  );
  
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // When prefilledFund changes (e.g. opened from Funds Explorer)
  useEffect(() => {
    if (!holding && prefilledFund) {
      setSelectedFund(prefilledFund);
    }
  }, [prefilledFund, holding]);

  useEffect(() => {
    if (!searchQuery || selectedFund) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/funds?search=${encodeURIComponent(searchQuery)}&limit=5`);
        if (res.ok) {
          const json = await res.json();
          // The API returns { data: { data: [...] } } or { data: [...] }
          setSearchResults(json.data?.data || json.data || []);
        }
      } catch (err) {
        // fail silently for search
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedFund]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFund && !holding) {
      setError('Please select a fund');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const isUpdate = !!(holding && holding.id);
      const url = isUpdate ? `/api/portfolio/holdings/${holding.id}` : `/api/portfolio/holdings`;
      const method = isUpdate ? 'PATCH' : 'POST';

      const payload = isUpdate ? {
        units: parseFloat(units),
        // we can optionally pass averageNav if we want, but letting backend keep old one is fine.
        // We'll let user only update units for simplicity in this modal.
      } : {
        schemeCode: selectedFund?.id || holding?.schemeCode,
        ...(inputType === 'units' ? { units: parseFloat(units) } : { amount: parseFloat(amount) })
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || errData.message || 'Failed to save holding');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">
            {holding ? 'Edit Holding' : 'Add New Holding'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            {!holding && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Mutual Fund</label>
                {!selectedFund ? (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      type="text"
                      placeholder="Type to search funds..."
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                      </div>
                    )}
                    
                    {searchResults.length > 0 && (
                      <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {searchResults.map(fund => (
                          <li 
                            key={fund.id || fund.schemeCode}
                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0"
                            onClick={() => {
                              setSelectedFund({ id: fund.id || fund.schemeCode, name: fund.name || fund.schemeName, category: fund.category });
                              setSearchQuery('');
                              setSearchResults([]);
                            }}
                          >
                            <div className="text-sm font-medium text-gray-900">{fund.name || fund.schemeName}</div>
                            <div className="text-xs text-gray-500">{fund.category}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 border border-blue-200 bg-blue-50 rounded-lg">
                    <div className="min-w-0 flex-1 pr-4">
                      <div className="text-sm font-semibold text-blue-900 truncate">{selectedFund.name}</div>
                      {selectedFund.category && <div className="text-xs text-blue-700">{selectedFund.category}</div>}
                    </div>
                    {!prefilledFund && (
                      <button 
                        type="button" 
                        onClick={() => setSelectedFund(null)}
                        className="text-blue-500 hover:text-blue-700 text-sm font-medium flex-shrink-0"
                      >
                        Change
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {holding && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fund</label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="text-sm font-semibold text-gray-900">{holding.fundName}</div>
                </div>
              </div>
            )}

            {holding ? (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Units</label>
                  <input 
                    type="number"
                    step="0.001"
                    required
                    min="0.001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-2">Update the number of units you currently hold.</p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex space-x-4 mb-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="inputType"
                      checked={inputType === 'amount'} 
                      onChange={() => setInputType('amount')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Enter Invested Amount</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="inputType"
                      checked={inputType === 'units'} 
                      onChange={() => setInputType('units')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Enter Units</span>
                  </label>
                </div>

              {inputType === 'amount' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Invested Amount (₹)</label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-2">Units will be automatically calculated using the latest real NAV.</p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Units</label>
                  <input 
                    type="number"
                    step="0.001"
                    required
                    min="0.001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-2">Invested value will be automatically calculated using the latest real NAV.</p>
                </div>
              )}
            </div>
            )}
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting || (!selectedFund && !holding)}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {holding ? 'Save Changes' : 'Add Holding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
