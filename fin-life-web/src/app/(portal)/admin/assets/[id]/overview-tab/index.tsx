'use client'

import { Asset } from '@/api/assets';
import Button from '@/components/button';
import { Switch } from '@mui/material';

interface OverviewTabProps {
  asset: Asset;
}

export default function OverviewTab({ asset }: OverviewTabProps) {
  const tabs: [string, string][] = [
    ['Ticker', asset.ticker],
    ['Categoria', asset.category],
    ['Classe', asset.class],
    ['Setor', asset.sector]
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="p-6 flex justify-end border-b border-white/[.1]">
        <Button
          color="primary"
          label="Editar"
          variant="contained"
        />
      </div>

      {tabs.map(([label, value]) => (
        <div
          key={value}
          className="border-b border-white/[.1] pb-6 flex items-center gap-24"
        >
          <span className="w-1/12 font-bold">
            {label}:
          </span>
          <span className="text-white/[.6]">
            {value}
          </span>
        </div>
      ))}

      <div className="flex items-center gap-24">
        <span className="w-1/12 font-bold">Ativo:</span>
        <Switch disabled checked={asset.active} />
      </div>
    </div>
  );
}
