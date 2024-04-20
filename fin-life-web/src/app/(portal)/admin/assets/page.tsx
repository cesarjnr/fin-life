import { getAssets } from '@/app/actions/assets';
import AssetsTable from './assets-table';

export default async function Assets() {
  const assets = await getAssets();

  return (
    <div className="self-center">
      <AssetsTable assets={assets} />
    </div>
  );
}
