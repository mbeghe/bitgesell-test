import React from 'react';
import { render, screen } from '@testing-library/react';
import { DataProvider, useData } from '../DataContext';

// Mock fetch
global.fetch = jest.fn();

// Test component to access context
const TestComponent = () => {
  const { items, loading, error, pagination } = useData();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <div data-testid="items-count">{items.length}</div>
      <div data-testid="pagination-total">{pagination?.total || 0}</div>
      {items.map(item => (
        <div key={item.id} data-testid={`item-${item.id}`}>
          {item.name}
        </div>
      ))}
    </div>
  );
};

describe('DataContext', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('provides initial state', () => {
    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );
    
    // Initially should show empty items list, not loading
    expect(screen.getByTestId('items-count')).toHaveTextContent('0');
    expect(screen.getByTestId('pagination-total')).toHaveTextContent('0');
  });

  it('provides context structure', () => {
    const TestHook = () => {
      const context = useData();
      return (
        <div>
          <div data-testid="has-items">{typeof context.items}</div>
          <div data-testid="has-loading">{typeof context.loading}</div>
          <div data-testid="has-error">{typeof context.error}</div>
          <div data-testid="has-fetchItems">{typeof context.fetchItems}</div>
        </div>
      );
    };

    render(
      <DataProvider>
        <TestHook />
      </DataProvider>
    );
    
    expect(screen.getByTestId('has-items')).toHaveTextContent('object');
    expect(screen.getByTestId('has-loading')).toHaveTextContent('boolean');
    expect(screen.getByTestId('has-error')).toHaveTextContent('object');
    expect(screen.getByTestId('has-fetchItems')).toHaveTextContent('function');
  });
});
