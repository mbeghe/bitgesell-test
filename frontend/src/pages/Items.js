import React, { useEffect, useState, useCallback } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';
import SearchAndPagination from '../components/SearchAndPagination';
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
  const itemsPerPage = 10;

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
      <div style={{ padding: '20px', color: 'red' }}>
        Error: {error}
      </div>
    );
  }

  const currentItems = useVirtualization ? allItems : items;
  const isLoading = useVirtualization ? virtualizationLoading : loading;

  return (
    <div>
      {/* Toggle between pagination and virtualization */}
      <div style={{ 
        padding: '20px', 
        borderBottom: '1px solid #eee',
        backgroundColor: '#f9f9f9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ margin: 0, color: '#333' }}>
            {useVirtualization ? 'Virtualized List (All Items)' : 'Paginated List'}
          </h3>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
            {useVirtualization 
              ? 'All items loaded with virtual scrolling for performance'
              : 'Traditional pagination with 10 items per page'
            }
          </p>
        </div>
        <button
          onClick={() => setUseVirtualization(!useVirtualization)}
          style={{
            padding: '10px 20px',
            border: '1px solid #007bff',
            backgroundColor: useVirtualization ? '#007bff' : 'white',
            color: useVirtualization ? 'white' : '#007bff',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {useVirtualization ? 'Switch to Pagination' : 'Switch to Virtualization'}
        </button>
      </div>

      {/* Show pagination controls only for traditional pagination */}
      {!useVirtualization && (
        <SearchAndPagination
          onSearch={handleSearch}
          onPageChange={handlePageChange}
          totalItems={pagination?.total || 0}
          currentPage={pagination?.page || 1}
          itemsPerPage={itemsPerPage}
          hasNext={pagination?.hasNext || false}
          hasPrev={pagination?.hasPrev || false}
          startItem={pagination?.startItem || 0}
          endItem={pagination?.endItem || 0}
        />
      )}

      {/* Show search for virtualization */}
      {useVirtualization && (
        <div style={{ 
          padding: '20px', 
          borderBottom: '1px solid #eee',
          backgroundColor: '#f9f9f9'
        }}>
          <input
            type="text"
            placeholder="Search items by name or category..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          <div style={{ 
            marginTop: '10px', 
            color: '#666', 
            fontSize: '14px' 
          }}>
            Showing {currentItems.length} items
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      ) : currentItems.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>No items found.</p>
        </div>
      ) : (
        <div style={{ padding: '0 20px' }}>
          {useVirtualization ? (
            <VirtualizedItemList 
              items={currentItems} 
              height={500}
            />
          ) : (
            // Traditional pagination - show items without virtualization
            <div style={{ 
              border: '1px solid #eee',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              {currentItems.map(item => (
                <div key={item.id} style={{
                  padding: '15px 20px',
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <Link 
                      to={'/items/' + item.id}
                      style={{
                        textDecoration: 'none',
                        color: '#007bff',
                        fontSize: '16px',
                        fontWeight: '500'
                      }}
                    >
                      {item.name}
                    </Link>
                    <div style={{ 
                      color: '#666', 
                      fontSize: '14px',
                      marginTop: '4px'
                    }}>
                      {item.category} • ${item.price}
                    </div>
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