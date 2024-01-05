'use client'

import { useForm } from 'react-hook-form';
import { useState } from 'react';

import { BuySell, BuySellTypes } from '@/api/buys-sells';
import { useModalContext } from '@/providers/modal';
import { formatCurrency } from '@/lib/currency';
import { Asset } from '@/api/assets';
import { SelectOption } from '@/components/input/select-input';
import Table, { RowData } from '@/components/table';
import Button from '@/components/button';
import Modal from '@/components/modal';
import Input from '@/components/input';

interface TranstactionsTableProps {
  assets: Asset[];
  buysSells: BuySell[];
}

export default function TransactionsTable({ assets, buysSells }: TranstactionsTableProps) {
  const { handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      asset: '',
      date: null,
      institution: '',
      price: '',
      quantity: '',
      type: ''
    }
  });
  const { setShow } = useModalContext();
  const [isButtonLoading, setIsButtonLoading] = useState(false);
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
  }));
  const typeInputOptions: SelectOption[] = [
    { label: 'Compra', value: 'buy' },
    { label: 'Venda', value: 'sell' }
  ];
  const handleFormSubmit = (data: any) => {
    console.log(data);

    setIsButtonLoading(true);

    setTimeout(() => {
      setShow(false);
      setIsButtonLoading(false);
    }, 5000);
  };

  return (
    <>
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
          onClick={() => setShow(true)}
          variant="contained"
        />
        <Table
          headers={tableHeaders}
          rowsData={tableData}
        />
      </div>

      <Modal title="Adicionar Transação">
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col gap-12"
        >
          <div className="flex flex-col gap-6">
            <Input
              name="asset"
              placeholder="Ativo"
              type="select"
              control={control}
              options={assetInputOptions}
            />
            <Input
              name="type"
              placeholder="Tipo"
              type="select"
              control={control}
              options={typeInputOptions}
            />
            <Input
              name="institution"
              placeholder="Instituição"
              type="text"
              control={control}
              errors={errors}
            />
            <Input
              name="quantity"
              placeholder="Quantidade"
              type="number"
              control={control}
            />
            <Input
              name="price"
              placeholder="Preço"
              type="currency"
              control={control}
            />
            <Input
              name="date"
              type="date"
              control={control}
            />
          </div>
          <div className="flex justify-end gap-5">
            {!isButtonLoading && (
              <Button
                label="Cancel"
                onClick={() => setShow(false)}
              />
            )}
            <Button
              label="Confirm"
              type="submit"
              loading={isButtonLoading}
            />
          </div>
        </form>
      </Modal>
    </>
  );
}
