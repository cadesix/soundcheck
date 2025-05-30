import React from 'react';
import styles from './Table.module.css'

export interface TableColumn<T> {
  header: string;
  accessor: keyof T | string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  title?: string;
  className?: string;
}

function Table<T extends { id: string | number } = any>({ columns, data, title, className }: TableProps<T>) {
  if (!data.length) return null;
  return (
    <>
      {title && <div className="h1">{title}</div>}
      <div className={className || styles['data-table-container']}>
        <table className={styles['data-table']}>
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={col.className}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.id}>
                {columns.map((col, idx) => (
                  <td key={idx} className={col.className}>
                    {col.render ? col.render(row) : String(row[col.accessor as keyof T] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Table; 