import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';

export default function NFTFilterPanel({
  filters,
  onFiltersChange,
  athletes = [],
  priceRange = [0, 1000]
}) {
  const [showPanel, setShowPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handlePriceChange = (type, value) => {
    const newRange = type === 'min' 
      ? [Math.min(Number(value), filters.priceRange[1]), filters.priceRange[1]]
      : [filters.priceRange[0], Math.max(Number(value), filters.priceRange[0])];
    onFiltersChange({ ...filters, priceRange: newRange });
  };

  const activeFiltersCount = [
    filters.rarity !== 'all' ? 1 : 0,
    filters.athlete ? 1 : 0,
    filters.priceRange[0] > 0 || filters.priceRange[1] < 1000 ? 1 : 0,
    filters.availability !== 'all' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const clearAllFilters = () => {
    onFiltersChange({
      rarity: 'all',
      athlete: '',
      priceRange: [0, 1000],
      availability: 'all',
    });
    setSearchQuery('');
  };

  const filteredAthletes = athletes.filter(a =>
    a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mb-8">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-fire-3/10 to-transparent border border-fire-3/20 text-fire-4 font-orbitron text-xs tracking-[2px] uppercase hover:border-fire-3/40 transition-all"
      >
        <Filter size={16} />
        ADVANCED FILTERS
        {activeFiltersCount > 0 && (
          <span className="ml-auto bg-fire-3 text-black px-2 py-1 rounded font-bold">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      <motion.div
        initial={false}
        animate={{ height: showPanel ? 'auto' : 0, opacity: showPanel ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="bg-gradient-to-br from-[rgba(10,4,18,0.95)] to-[rgba(4,2,8,0.99)] border-l border-r border-b border-fire-3/20 p-6 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Rarity Filter */}
            <div>
              <label className="block font-mono text-[10px] tracking-[2px] uppercase text-fire-3/60 mb-3">
                Card Tier
              </label>
              <select
                value={filters.rarity}
                onChange={(e) => handleFilterChange('rarity', e.target.value)}
                className="w-full bg-black/50 border border-fire-3/20 text-fire-4 font-mono text-sm p-2.5 outline-none focus:border-fire-3/50 transition-all"
              >
                <option value="all">All Tiers</option>
                <option value="common">Rising Stars</option>
                <option value="rare">Elite Performers</option>
                <option value="epic">Champions</option>
                <option value="legendary">Hall of Fame</option>
              </select>
            </div>

            {/* Athlete Filter */}
            <div>
              <label className="block font-mono text-[10px] tracking-[2px] uppercase text-fire-3/60 mb-3">
                Athlete
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                  <Search size={14} className="text-fire-3/40" />
                </div>
                <input
                  type="text"
                  placeholder="Search athlete..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/50 border border-fire-3/20 text-fire-4 font-mono text-sm p-2.5 pl-8 outline-none focus:border-fire-3/50 transition-all"
                />
              </div>
              {searchQuery && (
                <div className="absolute z-10 top-[calc(100%+2px)] left-0 right-0 bg-black/95 border border-fire-3/30 max-h-40 overflow-y-auto">
                  {filteredAthletes.length > 0 ? (
                    filteredAthletes.map((athlete) => (
                      <button
                        key={athlete}
                        onClick={() => {
                          handleFilterChange('athlete', athlete);
                          setSearchQuery('');
                        }}
                        className="w-full text-left px-3 py-2 text-sm font-mono text-fire-4 hover:bg-fire-3/10 transition-colors"
                      >
                        {athlete}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-fire-3/40">No athletes found</div>
                  )}
                </div>
              )}
              {filters.athlete && (
                <div className="mt-2 inline-block px-2 py-1 bg-fire-3/10 border border-fire-3/30 text-xs text-fire-4 font-mono">
                  {filters.athlete}
                  <button
                    onClick={() => handleFilterChange('athlete', '')}
                    className="ml-2 hover:text-fire-5"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block font-mono text-[10px] tracking-[2px] uppercase text-fire-3/60 mb-3">
                Price Range (€)
              </label>
              <div className="space-y-2">
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={filters.priceRange[0]}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  placeholder="Min"
                  className="w-full bg-black/50 border border-fire-3/20 text-fire-4 font-mono text-sm p-2 outline-none focus:border-fire-3/50 transition-all"
                />
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  placeholder="Max"
                  className="w-full bg-black/50 border border-fire-3/20 text-fire-4 font-mono text-sm p-2 outline-none focus:border-fire-3/50 transition-all"
                />
              </div>
              <div className="text-[10px] text-fire-3/40 mt-2">
                €{filters.priceRange[0]} - €{filters.priceRange[1]}
              </div>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="block font-mono text-[10px] tracking-[2px] uppercase text-fire-3/60 mb-3">
                Availability
              </label>
              <select
                value={filters.availability}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
                className="w-full bg-black/50 border border-fire-3/20 text-fire-4 font-mono text-sm p-2.5 outline-none focus:border-fire-3/50 transition-all"
              >
                <option value="all">All Status</option>
                <option value="available">In Stock</option>
                <option value="limited">Limited Stock</option>
                <option value="soldout">Sold Out</option>
                <option value="upcoming">Coming Soon</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-fire-3/10 border border-fire-3/30 text-fire-3 font-mono text-xs tracking-[1px] uppercase hover:bg-fire-3/20 transition-all"
            >
              <X size={14} />
              Clear All Filters
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}