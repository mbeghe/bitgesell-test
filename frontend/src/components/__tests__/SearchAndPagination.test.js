import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchAndPagination from '../SearchAndPagination';

describe('SearchAndPagination Component', () => {
  const mockProps = {
    onSearch: jest.fn(),
    onPageChange: jest.fn(),
    totalItems: 100,
    currentPage: 1,
    itemsPerPage: 10,
    hasNext: true,
    hasPrev: false,
    startItem: 1,
    endItem: 10
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input', () => {
    render(<SearchAndPagination {...mockProps} />);
    
    expect(screen.getByPlaceholderText(/Search items by name or category/i)).toBeInTheDocument();
  });

  it('renders pagination info', () => {
    render(<SearchAndPagination {...mockProps} />);
    
    expect(screen.getByText(/Showing 1-10 of 100 items/i)).toBeInTheDocument();
  });

  it('renders pagination controls', () => {
    render(<SearchAndPagination {...mockProps} />);
    
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('1 of 10')).toBeInTheDocument();
  });

  it('handles page navigation', () => {
    render(<SearchAndPagination {...mockProps} />);
    
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    expect(mockProps.onPageChange).toHaveBeenCalledWith(2);
  });

  it('disables previous button when on first page', () => {
    render(<SearchAndPagination {...mockProps} />);
    
    const prevButton = screen.getByText('Previous');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button when on last page', () => {
    const propsOnLastPage = {
      ...mockProps,
      currentPage: 10,
      hasNext: false,
      hasPrev: true,
      startItem: 91,
      endItem: 100
    };
    
    render(<SearchAndPagination {...propsOnLastPage} />);
    
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });

  it('enables both buttons when on middle page', () => {
    const propsOnMiddlePage = {
      ...mockProps,
      currentPage: 5,
      hasNext: true,
      hasPrev: true,
      startItem: 41,
      endItem: 50
    };
    
    render(<SearchAndPagination {...propsOnMiddlePage} />);
    
    const prevButton = screen.getByText('Previous');
    const nextButton = screen.getByText('Next');
    
    expect(prevButton).not.toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  it('shows correct page information', () => {
    const propsOnPage5 = {
      ...mockProps,
      currentPage: 5,
      startItem: 41,
      endItem: 50
    };
    
    render(<SearchAndPagination {...propsOnPage5} />);
    
    expect(screen.getByText('5 of 10')).toBeInTheDocument();
    expect(screen.getByText(/Showing 41-50 of 100 items/i)).toBeInTheDocument();
  });

  it('handles single page results', () => {
    const singlePageProps = {
      ...mockProps,
      totalItems: 5,
      itemsPerPage: 10,
      hasNext: false,
      hasPrev: false,
      startItem: 1,
      endItem: 5
    };
    
    render(<SearchAndPagination {...singlePageProps} />);
    
    expect(screen.getByText(/Showing 1-5 of 5 items/i)).toBeInTheDocument();
    expect(screen.getByText('1 of 1')).toBeInTheDocument();
  });
});
