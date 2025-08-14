import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../state/DataContext';

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { items, allItems, fetchAllItems, virtualizationLoading } = useData();

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Try to find item in current items (pagination mode)
    let foundItem = items.find(item => item.id == id);
    
    // If not found in current items, try in allItems (virtualization mode)
    if (!foundItem && allItems.length > 0) {
      foundItem = allItems.find(item => item.id == id);
    }
    
    if (foundItem) {
      setItem(foundItem);
      setLoading(false);
    } else {
      // Only fetch if we don't have any items loaded
      if (items.length === 0 && allItems.length === 0) {
        const abortController = new AbortController();
        
        fetchAllItems(abortController.signal)
          .catch(err => {
            console.error('Error fetching items:', err);
            setError(err.message);
            setLoading(false);
          });
        
        return () => abortController.abort();
      } else {
        // We have items but the specific item wasn't found
        setError('Item not found');
        setLoading(false);
      }
    }
  }, [id, items, allItems, fetchAllItems]);

  // Handle when items are loaded after fetch
  useEffect(() => {
    if ((items.length > 0 || allItems.length > 0) && loading) {
      const foundItem = items.find(item => item.id == id) || 
                       allItems.find(item => item.id == id);
      
      if (foundItem) {
        setItem(foundItem);
        setLoading(false);
      } else {
        setError('Item not found');
        setLoading(false);
      }
    }
  }, [items, allItems, id, loading]);

  if (loading || virtualizationLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        fontSize: '18px',
        color: '#666'
      }}>
        <div>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          Loading item details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '40px 20px',
        textAlign: 'center',
        color: '#dc3545'
      }}>
        <h3>Error loading item</h3>
        <p>{error}</p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Back to Items
        </button>
      </div>
    );
  }

  if (!item) {
    return (
      <div style={{
        padding: '40px 20px',
        textAlign: 'center',
        color: '#666'
      }}>
        <h3>Item not found</h3>
        <p>The item you're looking for doesn't exist.</p>
        <Link
          to="/"
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            display: 'inline-block',
            marginTop: '10px'
          }}
        >
          Back to Items
        </Link>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 20px'
    }}>
      {/* Back button */}
      <div style={{ marginBottom: '30px' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: '#007bff',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          ← Back to Items
        </Link>
      </div>

      {/* Item details */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '40px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        border: '1px solid #eee'
      }}>
        <h1 style={{
          margin: '0 0 20px 0',
          color: '#333',
          fontSize: '32px',
          fontWeight: '600'
        }}>
          {item.name}
        </h1>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginTop: '30px'
        }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{
              margin: '0 0 10px 0',
              color: '#495057',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Category
            </h3>
            <p style={{
              margin: 0,
              fontSize: '18px',
              color: '#333',
              fontWeight: '500'
            }}>
              {item.category}
            </p>
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{
              margin: '0 0 10px 0',
              color: '#495057',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Price
            </h3>
            <p style={{
              margin: 0,
              fontSize: '24px',
              color: '#28a745',
              fontWeight: '600'
            }}>
              ${item.price}
            </p>
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{
              margin: '0 0 10px 0',
              color: '#495057',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Item ID
            </h3>
            <p style={{
              margin: 0,
              fontSize: '16px',
              color: '#6c757d',
              fontFamily: 'monospace'
            }}>
              #{item.id}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;