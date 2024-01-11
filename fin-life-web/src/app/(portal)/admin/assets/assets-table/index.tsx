'use client'

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';

import { Asset, AssetCategories, AssetClasses, CreateAsset, createAsset } from '@/api/assets';
import { useModalContext } from '@/providers/modal';
import { SelectOption } from '@/components/input/select-input';
import Table, { RowData } from '@/components/table';
import Button from '@/components/button';
import Modal from '@/components/modal';
import Input from '@/components/input';

interface AssetsTableProps {
  assets: Asset[];
}
interface CreateAssetFormFields {
  assetClass: string;
  category: string;
  sector: string;
  ticker: string;
}

export default function AssetsTable({ assets }: AssetsTableProps) {
  const router = useRouter();
  const { setShow } = useModalContext();
  const { control, formState: { errors }, handleSubmit, reset } = useForm<CreateAssetFormFields>({
    defaultValues: {
      assetClass: '',
      category: '',
      sector: '',
      ticker: ''
    }
  });
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const onTableRowClick = useCallback((rowData: RowData) => {
    router.push(`assets/${rowData.id}`);
  }, [router]);
  const tableHeaders = [
    'Ticker',
    'Categoria',
    'Classe',
    'Setor',
    'Ativo'
  ];
  const tableData: RowData[] = assets.map((asset) => {
    const data = [
      asset.ticker,
      asset.category,
      asset.class,
      asset.sector,
      String(asset.active)
    ];

    return {
      id: asset.id,
      onClick: onTableRowClick,
      values: data
    };
  });
  const handleFormSubmit = async (data: CreateAssetFormFields) => {
    const createAssetData: CreateAsset = {
      assetClass: data.assetClass as AssetClasses,
      category: data.category as AssetCategories,
      sector: data.sector,
      ticker: data.ticker
    };

    setIsButtonLoading(true);

    try {
      const asset = await createAsset(createAssetData);

      assets.push(asset);

      toast('Ativo adicionado com sucesso!', { type: 'success' });
      reset();
      setShow(false);
    } catch (error: any) {
      toast(error.message, { type: 'error' });
    } finally {
      setIsButtonLoading(false);
    }
  };
  const categoryInputOptions: SelectOption[] = [
    { label: 'Renda Fixa', value: 'Renda Fixa' },
    { label: 'Renda Variável', value: 'Renda Variável' }
  ];
  const assetClassInputOptions: SelectOption[] = [
    { label: 'Ações', value: 'Ações' },
    { label: 'Internacionais', value: 'Internacionais' },
    { label: 'Imobiliários', value: 'Imobiliários' },
    { label: 'Caixa', value: 'Caixa' },
    { label: 'Criptomoedas', value: 'Criptomoedas' }
  ];

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
        min-w-[30vw]
      ">
        <Button
          color="primary"
          label="Adicionar Ativo"
          onClick={() => setShow(true)}
          variant="contained"
        />
        <Table headers={tableHeaders} rowsData={tableData} />
      </div>

      <Modal title="Adicionar Ativo">
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col gap-12"
        >
          <div className="flex flex-col gap-6">
            <Input
              name="ticker"
              placeholder="Ticker"
              type="text"
              control={control}
              errors={errors}
              validationRules={{ required: 'Ticker é obrigatório' }}
            />
            <Input
              name="category"
              placeholder="Categoria"
              type="select"
              control={control}
              errors={errors}
              options={categoryInputOptions}
              validationRules={{ required: 'Categoria é obrigatório' }}
            />
            <Input
              name="assetClass"
              placeholder="Classe"
              type="select"
              control={control}
              errors={errors}
              options={assetClassInputOptions}
              validationRules={{ required: 'Classe é obrigatório' }}
            />
            <Input
              name="sector"
              placeholder="Setor"
              type="text"
              control={control}
              errors={errors}
              validationRules={{ required: 'Setor é obrigatório' }}
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
