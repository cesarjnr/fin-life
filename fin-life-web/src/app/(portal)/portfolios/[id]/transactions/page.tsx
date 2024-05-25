import { getBuysSells } from '@/api/buys-sells';
import { getAssets } from '@/app/actions/assets';
import TransactionsTable from './transactions-table';

export default async function Transactions() {
  const buysSells = await getBuysSells(1, 1);
  const assets = await getAssets({ active: true });

  return (
    <div className="self-center">
      <TransactionsTable assets={assets} buysSells={buysSells} />
    </div>
  );
}
