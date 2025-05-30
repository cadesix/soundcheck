import React from 'react';
import FilterChip, { FilterChipOption } from './FilterChip';

interface TableHeaderProps {
  title: string;
  filter1?: {
    value: string;
    onChange: (value: string) => void;
    options: FilterChipOption[];
    className?: string;
  };
  filter2?: {
    value: string;
    onChange: (value: string) => void;
    options: FilterChipOption[];
    className?: string;
  };
  className?: string;
}

const TableHeader: React.FC<TableHeaderProps> = ({ title, filter1, filter2, className }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }} className={className}>
      <div className="h1">{title}</div>
      {(filter1 || filter2) && (
        <div style={{ display: 'flex', gap: '1rem' }}>
          {filter1 && (
            <FilterChip {...filter1} />
          )}
          {filter2 && (
            <FilterChip {...filter2} />
          )}
        </div>
      )}
    </div>
  );
};

export default TableHeader; 