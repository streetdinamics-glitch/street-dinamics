import React from 'react';
import { Filter } from 'lucide-react';

export default function TokenFilters({ filters, onFilterChange, sports = [] }) {
  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {/* Tier filter */}
      <div className="flex items-center gap-2">
        <Filter size={14} className="text-fire-3/40" />
        <select
          value={filters.tier}
          onChange={(e) => onFilterChange({ ...filters, tier: e.target.value })}
          className="cyber-input text-sm py-1.5 px-3 pr-8 cursor-pointer"
        >
          <option value="all">All Tiers</option>
          <option value="common">Common</option>
          <option value="uncommon">Uncommon</option>
          <option value="rare">Rare</option>
          <option value="legendary">Legendary</option>
        </select>
      </div>

      {/* Sport filter */}
      {sports.length > 0 && (
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-fire-3/40" />
          <select
            value={filters.sport}
            onChange={(e) => onFilterChange({ ...filters, sport: e.target.value })}
            className="cyber-input text-sm py-1.5 px-3 pr-8 cursor-pointer"
          >
            <option value="all">All Sports</option>
            {sports.map(sport => (
              <option key={sport} value={sport}>{sport}</option>
            ))}
          </select>
        </div>
      )}

      {/* Status filter */}
      <div className="flex items-center gap-2">
        <Filter size={14} className="text-fire-3/40" />
        <select
          value={filters.status}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
          className="cyber-input text-sm py-1.5 px-3 pr-8 cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="active">Available</option>
          <option value="sold_out">Sold Out</option>
        </select>
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2 ml-auto">
        <span className="font-mono text-[9px] text-fire-3/40 tracking-[1px] uppercase">Sort:</span>
        <select
          value={filters.sort}
          onChange={(e) => onFilterChange({ ...filters, sort: e.target.value })}
          className="cyber-input text-sm py-1.5 px-3 pr-8 cursor-pointer"
        >
          <option value="newest">Newest</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>
    </div>
  );
}