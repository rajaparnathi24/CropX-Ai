'use client';

import React, { useState } from 'react';

const CATEGORIES = [
  { id: 'chip-all', label: 'All', emoji: '🌾' },
  { id: 'chip-rice', label: 'Rice', emoji: '🌾' },
  { id: 'chip-wheat', label: 'Wheat', emoji: '🌿' },
  { id: 'chip-tomato', label: 'Tomato', emoji: '🍅' },
  { id: 'chip-cotton', label: 'Cotton', emoji: '🌸' },
  { id: 'chip-potato', label: 'Potato', emoji: '🥔' },
  { id: 'chip-maize', label: 'Maize', emoji: '🌽' },
  { id: 'chip-soybean', label: 'Soybean', emoji: '🫘' },
];

interface CategoryFilterProps {
  onFilter?: (category: string) => void;
}

export default function CategoryFilter({ onFilter }: CategoryFilterProps) {
  const [active, setActive] = useState('All');

  const handleSelect = (label: string) => {
    setActive(label);
    onFilter?.(label);
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleSelect(cat.label)}
          className={`chip flex-shrink-0 gap-1.5 ${active === cat.label ? 'chip-active' : 'chip-inactive'}`}
        >
          <span>{cat.emoji}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
