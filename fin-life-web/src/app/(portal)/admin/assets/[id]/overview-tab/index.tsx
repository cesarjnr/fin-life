'use client'

import { Asset } from '@/api/assets';
import Button from '@/components/button';
import { Switch } from '@mui/material';

interface OverviewTabProps {
  asset: Asset;
}

export default function OverviewTab({ asset }: OverviewTabProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="p-6 flex justify-end border-b border-white/[.1]">
        <Button
          color="primary"
          label="Editar"
          variant="contained"
        />
      </div>
      <div className="border-b border-white/[.1] pb-6">
        Ticker: {asset.ticker}
      </div>
      <div className="border-b border-white/[.1] pb-6">
        Categoria: {asset.category}
      </div>
      <div className="border-b border-white/[.1] pb-6">
        Classe: {asset.class}
      </div>
      <div className="border-b border-white/[.1] pb-6">
        Setor: {asset.sector}
      </div>
      <div>
        Ativo: <Switch disabled checked={asset.active} />
      </div>
    </div>
  );
}
