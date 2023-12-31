import { getBuysSells } from '@/api/buys-sells';
import TransactionsTable from './transactions-table';

export default async function Statement() {
  const buysSells = await getBuysSells(1, 1);

  return (
    <div className="self-center">
      <TransactionsTable buysSells={buysSells} />
    </div>
  );
}