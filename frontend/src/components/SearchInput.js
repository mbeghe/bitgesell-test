import React from 'react';
import { debounce } from 'lodash';

const SearchInput = ({ 
  searchTerm, 
  onSearch, 
  placeholder = "Search items by name or category...",
  debounceMs = 300 
}) => {
  const debouncedSearch = React.useMemo(
    () => debounce((term) => {
      onSearch(term);
    }, debounceMs),
    [onSearch, debounceMs]
  );

  const handleChange = (e) => {
    const value = e.target.value;
    debouncedSearch(value);
  };

  return (
    <input
      type="text"
      placeholder={placeholder}
      defaultValue={searchTerm}
      onChange={handleChange}
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
  );
};

export default SearchInput;
