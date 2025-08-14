import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VirtualizedItemList from '../VirtualizedItemList';

// Mock react-window
jest.mock('react-window', () => ({
  FixedSizeList: ({ children, itemCount, height }) => (
    <div data-testid="virtualized-list" style={{ height }}>
      {Array.from({ length: itemCount }, (_, index) => (
        <div key={`virtualized-item-${index}`}>
          {children({ index, style: {} })}
        </div>
      ))}
    </div>
  )
}));

describe('VirtualizedItemList Component', () => {
  const mockItems = [
    { id: 1, name: 'Test Item 1', category: 'Electronics', price: 10.99 },
    { id: 2, name: 'Test Item 2', category: 'Furniture', price: 20.50 },
    { id: 3, name: 'Test Item 3', category: 'Electronics', price: 15.75 }
  ];

  it('renders virtualized list with items', () => {
    render(
      <BrowserRouter>
        <VirtualizedItemList items={mockItems} height={400} />
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('virtualized-list')).toBeInTheDocument();
    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    expect(screen.getByText('Test Item 3')).toBeInTheDocument();
  });

  it('renders empty list when no items', () => {
    render(
      <BrowserRouter>
        <VirtualizedItemList items={[]} height={400} />
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('virtualized-list')).toBeInTheDocument();
    expect(screen.queryByText('Test Item 1')).not.toBeInTheDocument();
  });

  it('renders without crashing', () => {
    expect(() => {
      render(
        <BrowserRouter>
          <VirtualizedItemList items={mockItems} height={400} />
        </BrowserRouter>
      );
    }).not.toThrow();
  });
});
