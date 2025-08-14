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
      padding: '24px', 
      borderBottom: '1px solid #e9ecef',
      backgroundColor: 'white'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Search */}
        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="Search items by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '12px 16px',
              border: '2px solid #e9ecef',
              borderRadius: '8px',
              fontSize: '16px',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#007bff'}
            onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
          />
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ 
            color: '#6c757d',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Showing {startItem}-{endItem} of {totalItems} items
          </div>
          
          {/* Pagination Controls */}
          <div style={{ 
            display: 'flex', 
            gap: '8px',
            alignItems: 'center'
          }}>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!hasPrev}
              className="hover-effect"
              style={{
                padding: '10px 16px',
                border: '2px solid #e9ecef',
                backgroundColor: !hasPrev ? '#f8f9fa' : 'white',
                color: !hasPrev ? '#adb5bd' : '#495057',
                cursor: !hasPrev ? 'not-allowed' : 'pointer',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                minWidth: '80px'
              }}
            >
              Previous
            </button>
            
            <div style={{ 
              padding: '10px 16px',
              border: '2px solid #007bff',
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              minWidth: '80px',
              textAlign: 'center'
            }}>
              {currentPage} of {totalPages}
            </div>
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!hasNext}
              className="hover-effect"
              style={{
                padding: '10px 16px',
                border: '2px solid #e9ecef',
                backgroundColor: !hasNext ? '#f8f9fa' : 'white',
                color: !hasNext ? '#adb5bd' : '#495057',
                cursor: !hasNext ? 'not-allowed' : 'pointer',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                minWidth: '80px'
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchAndPagination;
