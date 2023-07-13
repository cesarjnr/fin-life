import Button from './button';

export interface TableProps {
  headers: string[];
  rowsData: {
    id: number;
    values: (string | number)[];
  }[];
  title: string;
}

export default function Table({
  headers,
  rowsData,
  title
}: TableProps) {
  return (
    <div className="w-3/6 py-4 px-6 bg-black-800 rounded-xl flex flex-col gap-8">
      <div className="flex justify-between">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <Button label="Adicionar" variant="primary" />
      </div>
      <table className="table-auto">
        <thead>
          <tr className="border-b border-white/[.1] text-sm text-left">
            {headers.map((header) => (
              <th
                key={header}
                className="p-2 "
              >{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowsData.map((rowData) => (
            <tr
              key={rowData.id}
              className="border-b border-white/[.1] text-sm text-white/[.6]"
            >
              {rowData.values.map((value) => (
                <td
                  key={`${rowData.id}-${value}`}
                  className="p-2"
                >
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
