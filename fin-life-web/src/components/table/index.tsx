export interface TableProps {
  headers: string[];
  rowsData: RowData[];
}
export interface RowData {
  id: string | number;
  ctx?: any;
  onClick?: (ctx: any) => void;
  values: (string | number)[];
}

export default function Table({ headers, rowsData }: TableProps) {
  return (
    <div className="self-start">
      {rowsData.length ?
        (
          <table className="table-auto w-full bg-black-800">
            <thead>
              <tr className="border-b border-white/[.1] text-sm text-left">
                {headers.map((header) => (
                  <th
                    key={header}
                    className="p-4 text-center"
                  >{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rowsData.map((rowData) => (
                <tr
                  key={rowData.id}
                  className={`
                    border-b
                    border-white/[.1]
                    text-sm
                    text-white/[.6]
                    ${rowData.onClick ? 'cursor-pointer hover:bg-white/[.02]' : ''}
                  `}
                >
                  {rowData.values.map((value, index) => (
                    <td
                      key={`${rowData.id}-${index}-${value}`}
                      className="p-4 text-center"
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) :
        (
          <div className="p-4">No data</div>
        )
      }
    </div>
  );
}
