import React, { useEffect, useState, useCallback } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';
import VirtualizedItemList from '../components/VirtualizedItemList';

function Items() {
  const { 
    items, 
    fetchItems, 
    loading, 
    error, 
    pagination,
    allItems,
    fetchAllItems,
    virtualizationLoading
  } = useData();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [useVirtualization, setUseVirtualization] = useState(false);
  const itemsPerPage = 5;

  // Fetch items with current search and pagination
  const loadItems = useCallback(async (abortSignal) => {
    if (useVirtualization) {
      await fetchAllItems(abortSignal, searchTerm);
    } else {
      const params = {
        limit: itemsPerPage,
        page: currentPage,
        q: searchTerm || undefined
      };
      await fetchItems(abortSignal, params);
    }
  }, [fetchItems, fetchAllItems, searchTerm, currentPage, useVirtualization]);

  // Handle search
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  // Load items when component mounts or search/page changes
  useEffect(() => {
    const abortController = new AbortController();
    loadItems(abortController.signal);
    return () => abortController.abort();
  }, [loadItems]);

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '300px',
        flexDirection: 'column',
        color: '#dc3545'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '20px'
        }}>
          ⚠️
        </div>
        <h3 style={{ margin: '0 0 10px 0' }}>Error loading items</h3>
        <p style={{ margin: 0, color: '#666' }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginTop: '20px',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  const currentItems = useVirtualization ? allItems : items;
  const isLoading = useVirtualization ? virtualizationLoading : loading;

  return (
    <div className="fade-in">
      {/* Toggle between pagination and virtualization */}
      <div style={{ 
        padding: '24px', 
        borderBottom: '1px solid #e9ecef',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ 
              margin: '0 0 8px 0', 
              color: '#333',
              fontSize: '24px',
              fontWeight: '600'
            }}>
              {useVirtualization ? 'Virtualized List' : 'Paginated List'}
            </h2>
            <p style={{ 
              margin: 0, 
              color: '#6c757d', 
              fontSize: '14px' 
            }}>
              {useVirtualization 
                ? 'All items loaded with virtual scrolling for optimal performance'
                : 'Traditional pagination with 10 items per page'
              }
            </p>
          </div>
          <button
            onClick={() => setUseVirtualization(!useVirtualization)}
            className="hover-effect"
            style={{
              padding: '12px 24px',
              border: '2px solid #007bff',
              backgroundColor: useVirtualization ? '#007bff' : 'white',
              color: useVirtualization ? 'white' : '#007bff',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            {useVirtualization ? 'Switch to Pagination' : 'Switch to Virtualization'}
          </button>
        </div>
      </div>

      {/* Search and Pagination Area - Fixed Height */}
      <div style={{ 
        padding: '24px', 
        borderBottom: '1px solid #e9ecef',
        backgroundColor: 'white',
        height: '120px', // Fixed height instead of minHeight
        position: 'relative' // For absolute positioning of pagination controls
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          {/* Search - Always at the top */}
          <div>
            <input
              type="text"
              placeholder="Search items by name or category..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
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

          {/* Pagination Controls - Only for traditional pagination */}
          {!useVirtualization ? (
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
                fontWeight: '500',
                lineHeight: '1.4'
              }}>
                Showing {pagination?.startItem || 0}-{pagination?.endItem || 0} of {pagination?.total || 0} items
              </div>
              
              {/* Pagination Controls */}
              <div style={{ 
                display: 'flex', 
                gap: '8px',
                alignItems: 'center'
              }}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination?.hasPrev}
                  className="hover-effect"
                  style={{
                    padding: '10px 16px',
                    border: '2px solid #e9ecef',
                    backgroundColor: !pagination?.hasPrev ? '#f8f9fa' : 'white',
                    color: !pagination?.hasPrev ? '#adb5bd' : '#495057',
                    cursor: !pagination?.hasPrev ? 'not-allowed' : 'pointer',
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
                  {pagination?.page || 1} of {Math.ceil((pagination?.total || 0) / itemsPerPage)}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination?.hasNext}
                  className="hover-effect"
                  style={{
                    padding: '10px 16px',
                    border: '2px solid #e9ecef',
                    backgroundColor: !pagination?.hasNext ? '#f8f9fa' : 'white',
                    color: !pagination?.hasNext ? '#adb5bd' : '#495057',
                    cursor: !pagination?.hasNext ? 'not-allowed' : 'pointer',
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
          ) : (
            /* Virtualization Info */
            <div style={{ 
              color: '#6c757d', 
              fontSize: '14px',
              fontWeight: '500',
              lineHeight: '1.4'
            }}>
              Showing {currentItems.length} items
            </div>
          )}
        </div>
      </div>
      
      {isLoading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '300px',
          flexDirection: 'column'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }}></div>
          <p style={{
            margin: 0,
            fontSize: '18px',
            color: '#666'
          }}>
            {useVirtualization ? 'Loading all items...' : 'Loading items...'}
          </p>
        </div>
      ) : currentItems.length === 0 ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '300px',
          flexDirection: 'column',
          color: '#6c757d'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '20px'
          }}>
            🔍
          </div>
          <h3 style={{ margin: '0 0 10px 0' }}>No items found</h3>
          <p style={{ margin: 0 }}>
            {searchTerm ? `No items match "${searchTerm}"` : 'No items available'}
          </p>
        </div>
      ) : (
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '24px',
        }}>
          {useVirtualization ? (
            <VirtualizedItemList 
              items={currentItems} 
              height={440}
            />
          ) : (
            // Traditional pagination - show items without virtualization
            <div style={{ 
              backgroundColor: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #e9ecef'
            }}>
              {currentItems.map((item, index) => (
                <div 
                  key={item.id} 
                  className="hover-effect"
                  style={{
                    padding: '20px 24px',
                    borderBottom: index < currentItems.length - 1 ? '1px solid #e9ecef' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'white'
                  }}
                >
                  <div>
                    <Link 
                      to={'/items/' + item.id}
                      style={{
                        textDecoration: 'none',
                        color: '#007bff',
                        fontSize: '18px',
                        fontWeight: '500',
                        display: 'block',
                        marginBottom: '4px',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                      }}
                    >
                      {item.name}
                    </Link>
                    <div style={{ 
                      color: '#6c757d', 
                      fontSize: '14px',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word'
                    }}>
                      {item.category} • ${item.price}
                    </div>
                  </div>
                  <div style={{
                    color: '#28a745',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    ${item.price}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Items;