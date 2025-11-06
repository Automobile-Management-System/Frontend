'use client';

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={`flex items-center justify-between px-6 py-4 border-t border-[#D5D9DE] animate-slide-in ${className}`}>
      {/* Showing X to Y of Z */}
      <div className="text-sm text-[#1F2A3C]">
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> items
      </div>

      {/* Page Buttons */}
      <div className="flex items-center gap-2">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 border border-[#D5D9DE] rounded-lg text-[#1F2A3C] hover:bg-[#F7F9FB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        {/* First Page + Ellipsis */}
        {start > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-2 border border-[#D5D9DE] rounded-lg text-[#1F2A3C] hover:bg-[#F7F9FB] transition-colors"
            >
              1
            </button>
            {start > 2 && <span className="px-2 text-[#B8BDC5]">...</span>}
          </>
        )}

        {/* Visible Pages */}
        {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 border rounded-lg transition-colors ${
              page === currentPage
                ? 'bg-[#0B2E66] text-white border-[#0B2E66]'
                : 'border-[#D5D9DE] text-[#1F2A3C] hover:bg-[#F7F9FB]'
            }`}
          >
            {page}
          </button>
        ))}

        {/* Ellipsis + Last Page */}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-2 text-[#B8BDC5]">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-2 border border-[#D5D9DE] rounded-lg text-[#1F2A3C] hover:bg-[#F7F9FB] transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 border border-[#D5D9DE] rounded-lg text-[#1F2A3C] hover:bg-[#F7F9FB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>

      {/* Scoped Animation */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}