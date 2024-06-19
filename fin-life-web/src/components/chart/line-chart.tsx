import { CartesianGrid, Legend, Line, LineChart as RechartLineChart, Tooltip, YAxis } from "recharts";

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

export default function LineChart({ data, ...rest }: LineChartProps) {
  const chartData = data.data.map((data) => ({
    name: data.name,
    ...data.values
  }));

  return (
    <RechartLineChart
      data={chartData}
      margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
      {...rest}
    >
      <CartesianGrid vertical={false} strokeWidth={0.1} />
      <YAxis
        allowDecimals={false}
        axisLine={false}
        domain={([dataMin, dataMax]) => {
          const tickCount = 50;
          const minGroupsOfFifty = Math.floor(dataMin / tickCount);
          const maxGroupsOfFifty = Math.floor(dataMax / tickCount);
          const min = tickCount * (minGroupsOfFifty + (minGroupsOfFifty < 0 ? 0 : 1));
          const max = tickCount * (maxGroupsOfFifty + (maxGroupsOfFifty < 0 ? 0 : 1));

          return [min > 0 ? 0 : min, max];
        }}
        interval="preserveStartEnd"
        tickCount={6}
        tickLine={false}
      />
      <Tooltip
        contentStyle={{ 'backgroundColor': 'rgba(3, 3, 3, .8)', 'border': '1px solid #002912' }}
        formatter={(data) => `${data}%`}
        labelFormatter={(_, payload) => ((payload[0]?.payload.name || '') as string)}
        wrapperClassName="text-xs"
      />
      <Legend />
      {data.keys.map((key) => (
        <Line key={key} dataKey={key} dot={false} stroke="#002912" />
      ))}
    </RechartLineChart>
  );
}
