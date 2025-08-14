import React from 'react';
import { FixedSizeList as List } from 'react-window';
import { Link } from 'react-router-dom';

const VirtualizedItemList = ({ items, height = 600 }) => {

  const itemHeight = 88; // Adjusted to better match paginated list row height

  // Row renderer function
  const Row = ({ index, style }) => {
    const item = items[index];
    
    if (!item) {
      return (
        <div style={style} className="item-row">
          <div style={{ 
            padding: '20px 24px', 
            textAlign: 'center', 
            color: '#666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%'
          }}>
            Loading...
          </div>
        </div>
      );
    }

    return (
      <div style={style} className="item-row hover-effect">
        <div 
          style={{
            padding: '20px 24px',
            borderBottom: index < items.length - 1 ? '1px solid #e9ecef' : 'none',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '100%',
            boxSizing: 'border-box',
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
                marginBottom: '4px'
              }}
            >
              {item.name}
            </Link>
            <div style={{ 
              color: '#6c757d', 
              fontSize: '14px'
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
      </div>
    );
  };

  return (
    <List
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      width="100%"
      style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        overflowX: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e9ecef'
      }}
    >
      {Row}
    </List>
  );
};

export default VirtualizedItemList;
