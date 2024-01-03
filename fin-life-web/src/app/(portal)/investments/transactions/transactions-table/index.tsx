'use client'

import { useForm } from 'react-hook-form';

import { BuySell, BuySellTypes } from '../../../../../api/buys-sells';
import { useModalContext } from '../../../../../providers/modal';
import Table, { RowData } from '@/components/table';
import { formatCurrency } from '@/lib/currency';
import Button from '@/components/button';
import Input, { SelectOption } from '../../../../../components/input';
import { Asset } from '../../../../../api/assets';

interface TranstactionsTableProps {
  assets: Asset[];
  buysSells: BuySell[];
}

export default function TransactionsTable({ assets, buysSells }: TranstactionsTableProps) {
  const { handleSubmit, control } = useForm({
    defaultValues: {
      institution: '',
      price: ''
    }
  });
  const { setShow, setTitle, setContent } = useModalContext();
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
  const assetInputOptions: SelectOption[] = assets.map((asset) => ({
    label: asset.ticker,
    value: String(asset.id)
  }))
  const handleFormSubmit = (data: any) => console.log(data);
  const setupModal = () => {
    setTitle('Adicionar Transação');
    setContent(
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="flex flex-col gap-12"
      >
        <div className="flex flex-col gap-6">
          <Input
            control={control}
            name="asset"
            placeholder="Ativo"
            type="select"
            selectOptions={assetInputOptions}
          />
          <Input
            control={control}
            name="institution"
            placeholder="Instituição"
            type="text"
          />
          <Input
            control={control}
            name="price"
            placeholder="Preço"
            type="text"
          />
        </div>
        <div className="flex justify-end gap-5">
          <Button
            label="Cancel"
            onClick={() => setShow(false)}
          />
          <Button
            label="Confirm"
            type="submit"
          />
        </div>
      </form>
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
