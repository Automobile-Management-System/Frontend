"use client";

import React from "react";

interface ServiceProgressControlsProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortOption: string;
  onSortChange: (option: string) => void;
  totalResults: number;
}

export const ServiceProgressControls: React.FC<ServiceProgressControlsProps> = ({
  searchTerm,
  onSearchChange,
  sortOption,
  onSortChange,
  totalResults,
}) => {

  const sortOptions = [
    { label: "Newest First", value: "date-desc" },
    { label: "Oldest First", value: "date-asc" },
    { label: "By Status", value: "status" },
  ];

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/20 shadow-xl mb-8">
      {/* --- MODIFIED: grid-cols-2 --- */}
      <div className="grid grid-cols-1  gap-4">
        {/* Search Bar */}
        <div className="md:col-span-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="relative">
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by customer, vehicle, service..."
              className="w-full px-4 py-3 rounded-xl border-gray-200 border shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

      </div>
      
      {/* --- MODIFIED: Updated text --- */}
      <p className="text-sm text-gray-600 mt-4">
        Showing <strong>{totalResults}</strong> matching results.
      </p>
    </div>
  );
};