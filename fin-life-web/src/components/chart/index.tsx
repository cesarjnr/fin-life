'use client';

import { ResponsiveContainer } from 'recharts';
import PieChart, { PieChartData } from './pie-chart';
import LineChart, { LineChartData } from './line-chart';

interface ChartProps {
  data: PieChartData[] | LineChartData;
  type: 'line' | 'pie'
}

export default function Chart({ data, type }: ChartProps) {
  const renderChart = () => {
    let chartComponent: JSX.Element;

    switch (type) {
      case 'line':
        chartComponent = <LineChart data={data as LineChartData} />;
        break;
      case 'pie':
        chartComponent = <PieChart data={data as PieChartData[]} />;
        break;
    }

    return chartComponent ? (
      <ResponsiveContainer width="100%" aspect={4.0/3.0} className="flex justify-center">
        {chartComponent}
      </ResponsiveContainer>
    ) : null;
  };

  return renderChart();
}
