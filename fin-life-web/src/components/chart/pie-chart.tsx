import { Cell, Pie, PieChart as RechartsPieChart, Tooltip } from "recharts";

interface PieChartProps {
  data: PieChartData[];
}
export interface PieChartData {
  name: string;
  value: number | string;
}

const cellColors = [
  '#00E663',
  '#950952',
  '#D5B942',
  '#54DEFD',
  '#9B1D20',
  '#FA824C'
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
        {data.map((_, index) => {
          const cellColor = cellColors[Math.floor(Math.random() * 6)];

          return (
            <Cell key={`cell-${index}`} fill={cellColor} />
          )
        })}
      </Pie>
      <Tooltip formatter={(data) => `${((data as number) * 100).toFixed(2)}%`} />
    </RechartsPieChart>
  );
}