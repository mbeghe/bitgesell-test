import React, { useState, useEffect } from 'react';

function SearchAndPagination({ 
  onSearch, 
  onPageChange, 
  totalItems, 
  currentPage, 
  itemsPerPage,
  hasNext,
  hasPrev,
  startItem,
  endItem
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Trigger search when debounced term changes
  useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div style={{ 
      padding: '20px', 
      borderBottom: '1px solid #eee',
      backgroundColor: '#f9f9f9'
    }}>
      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search items by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
      </div>

      {/* Pagination Info */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        <div style={{ color: '#666' }}>
          Showing {startItem}-{endItem} of {totalItems} items
        </div>
        
        {/* Pagination Controls */}
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrev}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              backgroundColor: !hasPrev ? '#f5f5f5' : 'white',
              color: !hasPrev ? '#999' : '#333',
              cursor: !hasPrev ? 'not-allowed' : 'pointer',
              borderRadius: '4px'
            }}
          >
            Previous
          </button>
          
          <span style={{ 
            padding: '8px 12px',
            border: '1px solid #ddd',
            backgroundColor: '#007bff',
            color: 'white',
            borderRadius: '4px'
          }}>
            {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNext}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              backgroundColor: !hasNext ? '#f5f5f5' : 'white',
              color: !hasNext ? '#999' : '#333',
              cursor: !hasNext ? 'not-allowed' : 'pointer',
              borderRadius: '4px'
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default SearchAndPagination;
