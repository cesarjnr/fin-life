import { getBuysSells } from '@/api/buys-sells';
import { getAssets } from '@/api/assets';
import TransactionsTable from './transactions-table';

export default async function Transactions() {
  const buysSells = await getBuysSells(1, 1);
  const assets = await getAssets();

  return (
    <div className="self-center">
      <TransactionsTable assets={assets} buysSells={buysSells} />
    </div>
  );
}