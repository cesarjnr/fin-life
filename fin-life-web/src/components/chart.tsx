'use client';

import { ResponsivePie } from '@nivo/pie';

interface ChartProps {
  data: ChartData[];
}
export interface ChartData {
  id: number | string;
  label: string;
  value: number | string;
}

export default function Chart({ data }: ChartProps) {
  return (
    <ResponsivePie
      sortByValue
      theme={{
        tooltip: {
          container: {
            background: '#171717',
            color: '#FFF',
            fontWeight: 700,
            fontSize: 10
          }
        },
        labels: {
          text: {
            fontWeight: 700
          }
        }
      }}
      colors={[
        '#003f5c',
        '#2f4b7c',
        '#665191',
        '#a05195',
        '#d45087',
        '#f95d6a',
        '#ff7c43',
        '#ffa600'
      ]}
      data={data}
      valueFormat=">-~%"
      margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
      innerRadius={0.5}
      padAngle={0.7}
      activeOuterRadiusOffset={12}
      arcLabelsSkipAngle={15}
      arcLinkLabelsTextColor={{ from: 'color' }}
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: 'color' }}
      arcLabelsTextColor="#FFF"
      motionConfig="wobbly"
    />
  );
}
