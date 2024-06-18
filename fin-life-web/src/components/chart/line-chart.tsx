import { CartesianGrid, Line, LineChart as RechartLineChart, Tooltip, YAxis } from "recharts";

interface LineChartProps {
  data: LineChartData;
}
export interface LineChartData {
  data: {
    name: string;
    values: {
      [key: string]: number;
    };
  }[];
  keys: string[];
}

export default function LineChart({ data }: LineChartProps) {
  const chartData = data.data.map((data) => ({
    name: data.name,
    ...data.values
  }));

  return (
    <RechartLineChart data={chartData} width={1200} height={500}>
      <CartesianGrid strokeDasharray="3 3" />
      <YAxis />
      <Tooltip />
      {data.keys.map((key) => (
        <Line key={key} dataKey={key} stroke="#8884d8" />
      ))}
    </RechartLineChart>
  );
}
