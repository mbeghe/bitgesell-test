import React from 'react';
import { FixedSizeList as List } from 'react-window';
import { Link } from 'react-router-dom';

const VirtualizedItemList = ({ items, height = 600 }) => {
  // Item height for each row
  const itemHeight = 80;

  // Row renderer function
  const Row = ({ index, style }) => {
    const item = items[index];
    
    if (!item) {
      return (
        <div style={style} className="item-row">
          <div style={{ 
            padding: '20px', 
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
      <div style={style} className="item-row">
        <div style={{
          padding: '15px 20px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '100%',
          boxSizing: 'border-box',
          backgroundColor: 'white'
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
        border: '1px solid #eee',
        borderRadius: '4px',
        backgroundColor: 'white'
      }}
    >
      {Row}
    </List>
  );
};

export default VirtualizedItemList;
