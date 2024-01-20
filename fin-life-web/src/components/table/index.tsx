'use client'

import { Skeleton } from '@mui/material';

export interface TableProps {
  isLoading?: boolean;
  headers: string[];
  rowsData: RowData[];
}
export interface RowData {
  id: string | number;
  onClick?: (rowData: RowData) => void;
  values: (string | number)[];
}

export default function Table({ isLoading, headers, rowsData }: TableProps) {
  const renderHeaders = () => {
    return headers.map((header) => (
      <th key={header} className="p-4">
          {header}
      </th>
    ));
  };
  const renderIsLoading = () => {
    const rows = [];

    for (let i = 0; i <= 5; i++) {
      rows.push(
        <tr
          key={`row-${i}`}
          className="border-b border-white/[.1]"
        >
          {headers.map((header) => (
            <td
              key={`row-${i}-header-${header}`}
              className="p-4"
            >
              <Skeleton
                sx={{ fontSize: '0.875rem' }}
                width="100%"
              />
            </td>
          ))}
        </tr>
      );
    }

    return rows;
  };
  const renderNoData = () => {
    return (
      <tr className="
        border-b
        border-white/[.1]
        text-sm
        text-white/[.6]"
      >
        <td className="p-4">
          No data
        </td>
      </tr>
    );
  };
  const renderData = () => {
    return rowsData.map((rowData) => (
      <tr
        key={rowData.id}
        className={`
          border-b
          border-white/[.1]
          text-sm
          text-white/[.6]
          ${rowData.onClick ? 'cursor-pointer hover:bg-white/[.02]' : ''}
        `}
        onClick={() => rowData.onClick && rowData.onClick(rowData)}
      >
        {rowData.values.map((value, index) => (
          <td
            key={`${rowData.id}-${index}-${value}`}
            className="p-4"
          >
            {value}
          </td>
        ))}
      </tr>
    ))
  };

  return (
    <div className="custom-table">
      <table className="table-auto w-full bg-black-800">
        <thead>
          <tr className="border-b border-white/[.1] text-sm text-left">
            {renderHeaders()}
          </tr>
        </thead>
        <tbody>
          {isLoading ? 
            renderIsLoading() : 
            (rowsData.length ? 
                renderData() :
                renderNoData()
            )
          }
        </tbody>
      </table>
    </div>
  );
};
