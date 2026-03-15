import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

/**
 * Reusable dropdown for selecting a sport category.
 * Falls back to a text input if no categories exist yet.
 */
export default function SportCategorySelect({ value, onChange, required = false, className = '' }) {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['sport-categories'],
    queryFn: () => base44.entities.SportCategory.filter({ is_active: true }, 'name', 100),
    initialData: [],
  });

  if (isLoading) {
    return (
      <select className={`cyber-input ${className}`} disabled>
        <option>Loading categories...</option>
      </select>
    );
  }

  if (categories.length === 0) {
    return (
      <input
        className={`cyber-input ${className}`}
        required={required}
        placeholder="No categories yet — add in Admin → Sport Categories"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <select
      className={`cyber-input ${className}`}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">— Select discipline —</option>
      {categories.map(cat => (
        <option key={cat.id} value={cat.name}>
          {cat.emoji ? `${cat.emoji} ` : ''}{cat.name}
        </option>
      ))}
    </select>
  );
}