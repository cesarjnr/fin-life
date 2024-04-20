'use client'

import { useState } from 'react';
import { toast } from 'react-toastify';

import { Asset } from '@/app/actions/assets/asset.types';
import { useModalContext } from '@/providers/modal';
import { updateAsset } from '@/app/actions/assets';
import Button from '@/components/button';
import Input from '@/components/input';
import AssetModal from '../../asset-modal';

interface OverviewTabProps {
  asset: Asset;
}

export default function OverviewTab({ asset }: OverviewTabProps) {
  const [assetState, setAssetState] = useState(asset);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const { setShow } = useModalContext();
  const rows: [string, string][] = [
    ['Ticker', asset.ticker],
    ['Categoria', asset.category],
    ['Classe', asset.class],
    ['Setor', asset.sector]
  ];
  const handleAssetUpdateFinish = (asset: Asset) => {
    setAssetState(asset);
    setShow(false);
  };
  const handleSwitchChange = async (value: string) => {
    const checked = value === 'true';
    const action = checked ? 'ativado' : 'desativado';

    setIsSwitchLoading(true);

    try {
      await updateAsset(asset.id, { active: checked });
      toast(`Ativo ${action} com sucesso!`, { type: 'success' });
    } catch (error: any) {
      toast(error.message, { type: 'error' });
    } finally {
      setIsSwitchLoading(false);
    }
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
            <Input
              initialValue={String(asset.active)}
              isLoading={isSwitchLoading}
              name="active"
              onChange={handleSwitchChange}
              type="switch"
            />
          </div>
        </div>
      </div>

      <AssetModal
        asset={assetState}
        title="Editar Produto"
        onCancel={() => setShow(false)}
        onFinish={handleAssetUpdateFinish}
      />
    </>
  );
}
