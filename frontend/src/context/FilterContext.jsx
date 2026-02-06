import { createContext, useContext, useState } from 'react';

const defaultFilters = {
  search: '',
  faculty: 'All Faculty',
  dateRange: 'all',
  orderBy: 'newest',
  dateStart: '',
  dateEnd: ''
};

const FilterContext = createContext();

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState(defaultFilters);
  return (
    <FilterContext.Provider value={{ filters, setFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within FilterProvider');
  }
  return context;
}