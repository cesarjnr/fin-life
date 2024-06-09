import { headers } from 'next/dist/client/components/headers';

import { getAssets } from '@/app/actions/assets';
import TransactionsTable from './transactions-table';

export default async function Transactions() {
  const headersList = headers();
  const pathname = headersList.get('x-current-path');
  const [portfolioId] = pathname!.match(/[0-9]/)!;
  const assets = await getAssets({ active: true });

  return (
    <div>
      <TransactionsTable assets={assets} portfolioId={Number(portfolioId)} />
    </div>
  );
}
