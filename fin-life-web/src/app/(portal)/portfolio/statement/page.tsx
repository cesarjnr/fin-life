import { getBuysSells } from '@/api/buys-sells';
import StatementTable from './statement-table';

export default async function Statement() {
  const buysSells = await getBuysSells(1, 1);

  return (
    <div className="self-center">
      <StatementTable buysSells={buysSells} />
    </div>
  );
}