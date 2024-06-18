import { Cell, Pie, PieChart as RechartsPieChart, Tooltip } from "recharts";

interface PieChartProps {
  data: PieChartData[];
}
export interface PieChartData {
  name: string;
  value: number | string;
}

const colors = [
  '#002912',
  '#003D1B',
  '#005223',
  '#00662C',
  '#007A35',
  '#008F3E',
  '#00A347',
  '#00B850',
  '#00CC58',
  '#00E061',
  '#00E663',
  '#0AFF74',
  '#1FFF80',
  '#33FF8B',
  '#47FF97',
  '#5CFFA3',
  '#70FFAE',
  '#85FFBA',
  '#99FFC5',
  '#ADFFD1',
  '#C2FFDC',
  '#D6FFE8',
  '#EBFFF3'
];

export default function PieChart({ data }: PieChartProps) {
  return (
    <RechartsPieChart width={400} height={300}>
      <Pie
        nameKey="name"
        dataKey="value"
        data={data}
        label={(data) => data.name}
      >
        {data.map((_, index) => (
          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
        ))}
      </Pie>
      <Tooltip formatter={(data) => `${((data as number) * 100).toFixed(2)}%`} />
    </RechartsPieChart>
  );
}