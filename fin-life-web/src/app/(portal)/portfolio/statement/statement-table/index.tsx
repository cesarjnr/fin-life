'use client'

import { BuySell, BuySellTypes } from '../../../../../api/buys-sells';
import { useModalContext } from '../../../../../providers/modal';
import Table, { RowData } from '@/components/table';
import { formatCurrency } from '@/lib/currency';
import Button from '@/components/button';

interface StatementTableProps {
  buysSells: BuySell[];
}

export default function StatementTable({ buysSells }: StatementTableProps) {
  const { setShow, setTitle, setContent, setActions } = useModalContext();
  const buySellActionsMap = new Map([
    [BuySellTypes.Buy, 'Compra'],
    [BuySellTypes.Sell, 'Venda']
  ]);
  const tableHeaders = [
    'Data',
    'Ativo',
    'Ação',
    'Preço',
    'Quantidade',
    'Total'
  ];
  const tableData: RowData[] = buysSells.map((buySell) => {
    const data = [
      buySell.date,
      buySell.asset.ticker,
      buySellActionsMap.get(buySell.type)!,
      formatCurrency(buySell.price),
      buySell.quantity,
      formatCurrency(buySell.price * buySell.quantity)
    ];

    return {
      id: buySell.id,
      values: data
    };
  });
  const setupModal = () => {
    setTitle('Test');
    setContent(<div>Test</div>);
    setActions(
      <>
        <Button label="Cancel" onClick={() => setShow(false)} />
        <Button label="Confirm" onClick={() => setShow(false)} />
      </>
    );
    setShow(true);
  };

  return (
    <div className="
      p-6
      rounded-xl
      bg-black-800
      flex
      flex-col
      items-end
      gap-8
    ">
      <Button
        color="primary"
        label="Adicionar Transação"
        onClick={() => setupModal()}
        variant="contained"
      />
      <Table
        headers={tableHeaders}
        rowsData={tableData}
      />
    </div>
  );
}
