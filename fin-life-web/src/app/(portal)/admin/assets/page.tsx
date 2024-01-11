import { getAssets } from '@/api/assets';
import AssetsTable from './assets-table';

export default async function Assets() {
  const assets = await getAssets();

  return (
    <div className="self-center">
      <AssetsTable assets={assets} />
    </div>
  );
}
