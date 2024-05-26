import { headers } from 'next/dist/client/components/headers';

import { getAssets } from '@/app/actions/assets';
import { getBuysSells } from '@/app/actions/buys-sells';
import TransactionsTable from './transactions-table';

export default async function Transactions() {
  const headersList = headers();
  const pathname = headersList.get('x-current-path');
  const [portfolioId] = pathname!.match(/[0-9]/)!;
  const buysSells = await getBuysSells(1, Number(portfolioId));
  const assets = await getAssets({ active: true });

  return (
    <div>
      <TransactionsTable assets={assets} buysSells={buysSells} />
    </div>
  );
}
