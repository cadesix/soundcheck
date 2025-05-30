import React from 'react';
import styles from './FilterChip.module.css';

export interface FilterChipOption {
  value: string;
  label: string;
}

interface FilterChipProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterChipOption[];
  className?: string;
}

const FilterChip: React.FC<FilterChipProps> = ({ value, onChange, options, className }) => {
  return (
    <select
      className={className || styles['chip-dropdown']}
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default FilterChip; 