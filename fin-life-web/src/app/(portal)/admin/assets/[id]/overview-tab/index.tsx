'use client'

import { useState } from 'react';

import { Asset } from '@/api/assets/asset.types';
import Button from '@/components/button';
import { Switch } from '@mui/material';
import Input, { InputProps } from '@/components/input';
import { SelectOption } from '@/components/input/select-input';
import { useForm } from 'react-hook-form';
import { useModalContext } from '@/providers/modal';
import Modal from '@/components/modal';
import AssetModal from '../../asset-modal';

interface OverviewTabProps {
  asset: Asset;
}

export default function OverviewTab({ asset }: OverviewTabProps) {
  const { setShow } = useModalContext();
  const rows: [string, string][] = [
    ['Ticker', asset.ticker],
    ['Categoria', asset.category],
    ['Classe', asset.class],
    ['Setor', asset.sector]
  ];
  const handleAssetUpdateFinish = (asset: Asset) => {
    console.log(asset);

    setShow(false);
  };

  return (
    <>
      <div>
        <div className="flex justify-end">
          <Button
            color="primary"
            label="Editar"
            onClick={() => setShow(true)}
            variant="contained"
          />
        </div>

        <div className="flex flex-col gap-6">
          {rows.map((row) => (
            <div
              key={row[1]}
              className="border-b border-white/[.1] pb-6 flex items-center gap-24"
            >
              <span className="w-1/12 font-bold">
                {row[0]}:
              </span>
              <span className="text-white/[.6]">
                {row[1]}
              </span>
            </div>
          ))}

          <div className="border-b border-white/[.1] pb-6 flex items-center gap-24">
            <span className="w-1/12 font-bold">Ativo:</span>
            <Switch disabled checked={asset.active} />
          </div>
        </div>
      </div>

      <AssetModal
        asset={asset}
        title="Editar Ativo"
        onCancel={() => setShow(false)}
        onFinish={handleAssetUpdateFinish}
      />
    </>
  );
}
