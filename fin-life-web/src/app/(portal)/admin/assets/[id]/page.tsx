import { findAsset } from '@/api/assets';
import AssetOverview from './asset-overview';
import AssetData from './asset-data';

interface AssetDetailsProps {
  params: {
    id: string;
  };
}

export default async function AssetDetails({ params }: AssetDetailsProps) {
  const asset = await findAsset(Number(params.id));

  return (
    <div className="asset-details h-full flex-1 flex flex-col gap-5">
      <AssetOverview asset={asset} />
      {/* <AssetData asset={asset} /> */}
    </div>
  );
}