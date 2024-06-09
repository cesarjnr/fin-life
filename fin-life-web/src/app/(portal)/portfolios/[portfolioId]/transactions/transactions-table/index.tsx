'use client'

import { useForm } from 'react-hook-form';
import { useCallback, useLayoutEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

import { createBuySell, getBuysSells } from '@/app/actions/buys-sells/index';
import { BuySellTypes, CreateBuySell } from '@/app/actions/buys-sells/buys-sells.types';
import { useModalContext } from '@/providers/modal';
import { formatCurrency } from '@/utils/currency';
import { Asset } from '@/app/actions/assets/asset.types';
import { SelectOption } from '@/components/input/select-input';
import { transactionsTableHeaders } from '../loading';
import Table, { RowData, TablePagination } from '@/components/table';
import Button from '@/components/button';
import Modal from '@/components/modal';
import Input from '@/components/input';

interface TransactionsTableProps {
  assets: Asset[];
  portfolioId: number;
}
interface TableConfig {
  data: RowData[];
  headers: string[];
  name: string;
  pagination?: TablePagination;
}
interface CreateTransactionFormFields {
  asset: string,
  date: Date | null;
  fees?: string,
  institution: string,
  price: string,
  quantity: string,
  type: string
}

const buySellActionsMap = new Map([
  [BuySellTypes.Buy, 'Compra'],
  [BuySellTypes.Sell, 'Venda']
]);

export default function TransactionsTable({ assets, portfolioId }: TransactionsTableProps) {
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [transactionsTableConfig, setTransactionsTableConfig] = useState<TableConfig>({
    data: [],
    headers: transactionsTableHeaders,
    name: 'prices'
  });
  const { control, formState: { errors }, handleSubmit, reset } = useForm<CreateTransactionFormFields>({
    defaultValues: {
      asset: '',
      date: null,
      institution: '',
      price: '',
      fees: '',
      quantity: '',
      type: ''
    }
  });
  const { setShow } = useModalContext();
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const assetInputOptions: SelectOption[] = assets.map((asset) => ({
    label: asset.ticker,
    value: String(asset.id)
  }));
  const typeInputOptions: SelectOption[] = [
    { label: 'Compra', value: 'buy' },
    { label: 'Venda', value: 'sell' }
  ];
  const setupTransactionsTable = useCallback(
    async (page: number = 0, limit: number = 10) => {
      setIsTableLoading(true);

      const response = await getBuysSells({
        userId: 1,
        portfolioId,
        page: String(page),
        limit: String(limit)
      });
      const tableData: RowData[] = response.data.map((buySell) => {
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

      setTransactionsTableConfig((prevState) => ({
        ...prevState,
        data: tableData,
        pagination: {
          onPaginationChange: (_: string, page: number, rowsPerPage: number) => {
            setupTransactionsTable(page, rowsPerPage);
          },
          page: response.page,
          rowsPerPage: response.itemsPerPage,
          total: response.total
        }
      }));
      setIsTableLoading(false);
    },
    [portfolioId]
  );
  const handleFormSubmit = async (data: CreateTransactionFormFields) => {
    const createBuySellData: CreateBuySell = {
      assetId: Number(data.asset),
      date: format(data.date!, 'yyyy-MM-dd'),
      institution: data.institution,
      price: Number(data.price),
      quantity: Number(data.quantity),
      type: data.type as BuySellTypes
    };

    if (data.fees) {
      createBuySellData.fees = Number(data.fees);
    }

    setIsButtonLoading(true);

    try {
      await createBuySell(1, 1, createBuySellData); 

      toast('Transação adicionada com sucesso!', { type: 'success' });
      reset();
      setShow(false);
    } catch (error: any) {
      toast(error.message, { type: 'error' });
    } finally {
      setIsButtonLoading(false);
    }
  };

  useLayoutEffect(() => {
    setupTransactionsTable();

    console.log(transactionsTableConfig);
  }, [setupTransactionsTable]);

  return (
    <>
      <div className="
        p-6
        rounded-xl
        bg-black-800
        flex
        flex-col
        gap-8
        min-w-[50vw]
      ">
        <div className="self-end">
          <Button
            color="primary"
            label="Adicionar Transação"
            onClick={() => setShow(true)}
            variant="contained"
          />
        </div>
        <Table
          isLoading={isTableLoading}
          headers={transactionsTableConfig.headers}
          name="transactions"
          pagination={transactionsTableConfig.pagination}
          rowsData={transactionsTableConfig.data}
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
              errors={errors}
              options={assetInputOptions}
              validationRules={{ required: 'Ativo é obrigatório' }}
            />
            <Input
              name="type"
              placeholder="Tipo"
              type="select"
              control={control}
              errors={errors}
              options={typeInputOptions}
              validationRules={{ required: 'Tipo é obrigatório' }}
            />
            <Input
              name="institution"
              placeholder="Instituição"
              type="text"
              control={control}
              errors={errors}
              validationRules={{ required: 'Instituição é obrigatório' }}
            />
            <Input
              name="quantity"
              placeholder="Quantidade"
              type="number"
              control={control}
              errors={errors}
              validationRules={{ required: 'Quantidade é obrigatório' }}
            />
            <Input
              name="price"
              placeholder="Preço"
              type="currency"
              control={control}
              errors={errors}
              validationRules={{ required: 'Preço é obrigatório' }}
            />
            <Input
              name="fees"
              placeholder="Taxas"
              type="currency"
              control={control}
            />
            <Input
              name="date"
              placeholder="Data"
              type="date"
              control={control}
              errors={errors}
              validationRules={{ required: 'Data é obrigatório' }}
            />
          </div>
          <div className="flex justify-end gap-5">
            {!isButtonLoading && (
              <Button label="Cancel" onClick={() => setShow(false)} />
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
