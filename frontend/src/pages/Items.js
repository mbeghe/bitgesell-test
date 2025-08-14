import React, { useEffect, useState, useCallback } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';
import VirtualizedItemList from '../components/VirtualizedItemList';
import SearchAndPagination from '../components/SearchAndPagination';
import SearchInput from '../components/SearchInput';

function Items() {
  const { 
    items, 
    fetchItems, 
    loading, 
    error, 
    pagination
  } = useData();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [useVirtualization, setUseVirtualization] = useState(false);
  const itemsPerPage = 5;

  // Fetch items with current search and pagination
  const loadItems = useCallback(async (abortSignal, searchQuery = searchTerm) => {
    if (useVirtualization) {
      const params = searchQuery ? { q: searchQuery } : {};
      await fetchItems(abortSignal, params);
    } else {
      const params = {
        limit: itemsPerPage,
        page: currentPage,
        q: searchQuery || undefined
      };
      await fetchItems(abortSignal, params);
    }
  }, [fetchItems, searchTerm, currentPage, useVirtualization, itemsPerPage]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  // Load items when component mounts or page changes (for pagination)
  useEffect(() => {
    if (!useVirtualization) {
      const abortController = new AbortController();
      loadItems(abortController.signal);
      return () => abortController.abort();
    }
  }, [loadItems, useVirtualization]);

  useEffect(() => {
    if (useVirtualization) {
      const abortController = new AbortController();
      loadItems(abortController.signal);
      return () => abortController.abort();
    }
  }, [useVirtualization, loadItems]);

  useEffect(() => {
    if (useVirtualization) {
      const abortController = new AbortController();
      loadItems(abortController.signal, searchTerm);
      return () => abortController.abort();
    }
  }, [searchTerm, useVirtualization, loadItems]);

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

      {!useVirtualization && (
        <SearchAndPagination
          onSearch={handleSearch}
          onPageChange={handlePageChange}
          totalItems={pagination?.total || 0}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          hasNext={pagination?.hasNext || false}
          hasPrev={pagination?.hasPrev || false}
          startItem={pagination?.startItem || 0}
          endItem={pagination?.endItem || 0}
        />
      )}

      {useVirtualization && (
        <div style={{ 
          padding: '24px', 
          borderBottom: '1px solid #e9ecef',
          backgroundColor: 'white'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <SearchInput onSearch={handleSearch} />
            <div style={{ 
              color: '#6c757d', 
              fontSize: '14px',
              fontWeight: '500',
              marginTop: '12px'
            }}>
              Showing {items.length} items
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
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
      ) : items.length === 0 ? (
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
              items={items} 
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
              {items.map((item, index) => (
                <div 
                  key={item.id} 
                  className="hover-effect"
                  style={{
                    padding: '20px 24px',
                    borderBottom: index < items.length - 1 ? '1px solid #e9ecef' : 'none',
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