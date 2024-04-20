'use client'

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { FaCheck } from "react-icons/fa6";
import { MdClose } from "react-icons/md";

import { Asset } from '@/app/actions/assets/asset.types';
import { useModalContext } from '@/providers/modal';
import { assetsTableHeaders } from '../loading';
import Table, { RowData } from '@/components/table';
import Button from '@/components/button';
import AssetModal from '../asset-modal';

interface AssetsTableProps {
  assets: Asset[];
}

export default function AssetsTable({ assets }: AssetsTableProps) {
  const router = useRouter();
  const { setShow } = useModalContext();
  const onTableRowClick = useCallback((rowData: RowData) => {
    router.push(`assets/${rowData.id}`);
  }, [router]);
  const tableData: RowData[] = assets.map((asset) => {
    const activeIconComponent = asset.active ?
      <FaCheck size={22} color="#00e663" /> :
      <MdClose size={22} color="#d32f2f" />;
    const data = [
      asset.ticker,
      asset.category,
      asset.class,
      asset.sector,
      activeIconComponent
    ];

    return {
      id: asset.id,
      onClick: onTableRowClick,
      values: data
    };
  });
  const handleAssetCreateFinish = async (asset: Asset) => {
    assets.push(asset);
    setShow(false);
  };

  return (
    <>
      <div className="
        p-6
        rounded-xl
        bg-black-800
        flex
        flex-col
        gap-8
        min-w-[50vw]
      ">
        <div className="self-end">
          <Button
            color="primary"
            label="Adicionar Produto"
            onClick={() => setShow(true)}
            variant="contained"
          />
        </div>
        <Table
          headers={assetsTableHeaders}
          name="assets"
          rowsData={tableData}
        />
      </div>

      <AssetModal
        title="Adicionar Produto"
        onCancel={() => setShow(false)}
        onFinish={handleAssetCreateFinish}
      />
    </>
  );
}
