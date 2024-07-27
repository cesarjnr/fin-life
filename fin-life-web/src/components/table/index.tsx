'use client'

import { ReactNode } from 'react';
import { FormControl, MenuItem, Select, SelectChangeEvent, Skeleton } from '@mui/material';
import { MdFirstPage, MdLastPage, MdNavigateBefore, MdNavigateNext } from 'react-icons/md';
import IconButton from '../icon-button';

export interface TableProps {
  name: string;
  isLoading?: boolean;
  headers: string[];
  pagination?: TablePagination;
  rowsData: RowData[];
}
export interface TablePagination {
  onPaginationChange: (table: string, page: number, rowsPerPage: number) => void;
  page: number;
  rowsPerPage: number;
  total: number;
}
export interface RowData {
  id: string | number;
  onClick?: (rowData: RowData) => void;
  values: (string | number | ReactNode)[];
}

export default function Table({ isLoading, headers, name, pagination, rowsData }: TableProps) {
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
  const handleItemsPerPageInputChange = (event: SelectChangeEvent) => {
    const newRowsPerPage = Number(event.target.value);

    pagination!.onPaginationChange(name, pagination!.page, newRowsPerPage);
  };
  const handlePageButtonClick = (action: 'first' | 'previous' | 'next' | 'last') => {
    let newPage = pagination!.page;

    switch (action) {
      case 'first':
        newPage = 0;
        break;
      case 'previous':
        newPage--;
        break;
      case 'next':
        newPage++;
        break;
      case 'last':
        newPage = Math.floor(pagination!.total / pagination!.rowsPerPage);
        break;
      default:
        break;
    }

    pagination!.onPaginationChange(name, newPage, pagination!.rowsPerPage);
  };
  const renderPaginationLabels = () => {
    const { page, rowsPerPage, total } = pagination!;
    const from = (page + 1) * rowsPerPage - (rowsPerPage - 1);
    const to = (page + 1) * rowsPerPage < total ? (page + 1) * rowsPerPage : total;

    return `${from}-${to} de ${total}`;
  };
  const disableFirstPageButton = pagination?.page === 0;
  const disablePreviousPageButton = pagination?.page === 0;
  const disableNextPageButton = pagination && ((pagination.page + 1) * pagination.rowsPerPage > pagination.total);
  const disableLastPageButton = pagination && ((pagination.page + 1) * pagination.rowsPerPage > pagination.total);

  return (
    <div className="custom-table h-full overflow-auto text-sm">
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
      {pagination && (
        <div className="p-4 flex justify-end items-center gap-7 text-sm">
          <div className="flex items-center gap-3">
            Itens por página:
            <FormControl variant="standard">
              <Select
                MenuProps={{
                  sx: {
                    '.MuiPaper-root': {
                      backgroundColor: '#171717',
                      color: '#FFF'
                    },
                    li: {
                      ':hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)'
                      }
                    },
                    '.Mui-selected': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08) !important',
                      ':hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)'
                      }
                    }
                  }
                }}
                sx={{
                  color: 'rgb(255, 255, 255)',
                  ':before': {
                    borderBottom: '1px solid rgb(255, 255, 255) !important'
                  },
                  ':after': {
                    borderBottom: '2px solid rgb(255, 255, 255)'
                  },
                  'MuiSelect-icon': {
                    fill: 'rgb(255, 255,'
                  },
                }}
                onChange={handleItemsPerPageInputChange}
                value={String(pagination.rowsPerPage)}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div>
            {renderPaginationLabels()}
          </div>
          <div>
            <IconButton
              disabled={disableFirstPageButton}
              IconComponent={MdFirstPage}
              onClick={() => handlePageButtonClick('first')}
              size={24}
            />
            <IconButton
              disabled={disablePreviousPageButton}
              IconComponent={MdNavigateBefore}
              onClick={() => handlePageButtonClick('previous')}
              size={24}
            />
            <IconButton
              disabled={disableNextPageButton}
              IconComponent={MdNavigateNext}
              onClick={() => handlePageButtonClick('next')}
              size={24}
            />
            <IconButton
              disabled={disableLastPageButton}
              IconComponent={MdLastPage}
              onClick={() => handlePageButtonClick('last')}
              size={24}
            />
          </div>
        </div>
      )}
    </div>
  );
};
