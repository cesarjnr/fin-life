'use client'

import { useForm } from 'react-hook-form';

import { BuySell, BuySellTypes } from '@/api/buys-sells';
import { useModalContext } from '@/providers/modal';
import { formatCurrency } from '@/lib/currency';
import { Asset } from '@/api/assets';
import SelectInput, { SelectOption } from '@/components/select-input';
import Table, { RowData } from '@/components/table';
import Button from '@/components/button';
import TextInput from '@/components/text-input';
import CurrencyInput from '@/components/currency-input';
import DateInput from '@/components/date-input';
import NumberInput from '@/components/number-input';
import Modal from '@/components/modal';

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
  const handleFormSubmit = (data: any) => console.log(data);

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
            <SelectInput
              control={control}
              name="asset"
              placeholder="Ativo"
              options={assetInputOptions}
            />
            <SelectInput
              control={control}
              name="type"
              placeholder="Tipo"
              options={typeInputOptions}
            />
            <TextInput
              control={control}
              name="institution"
              placeholder="Instituição"
              errors={errors}
            />
            <NumberInput
              control={control}
              name="quantity"
              placeholder="Quantidade"
            />
            <CurrencyInput
              control={control}
              name="price"
              placeholder="Preço"
            />
            <DateInput control={control} name="date" />
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
      </Modal>
    </>
  );
}
