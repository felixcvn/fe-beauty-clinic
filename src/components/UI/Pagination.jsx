import React from 'react';

/**
 * Reusable Pagination component
 * Props:
 *   currentPage  - current active page (number)
 *   totalPages   - total number of pages (number)
 *   onPageChange - callback(newPage) when a button is clicked
 *   className    - optional extra class for the wrapper
 */
const Pagination = ({ currentPage, totalPages, onPageChange, className = '' }) => {
    if (!totalPages || totalPages <= 1) return null;

    return (
        <div className={`flex items-center justify-between gap-3 pt-4 ${className}`}>
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-7 py-3 rounded-2xl border-2 border-primary/10 bg-white text-primary/60 font-black text-xs uppercase tracking-widest hover:border-primary/30 hover:text-primary transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 shadow-sm"
            >
                Sebelumnya
            </button>

            <span className="text-xs font-black text-primary/30 uppercase tracking-widest">
                {currentPage} / {totalPages}
            </span>

            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-7 py-3 rounded-2xl bg-primary text-secondary font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 shadow-lg shadow-primary/20"
            >
                Selanjutnya
            </button>
        </div>
    );
};

export default Pagination;
