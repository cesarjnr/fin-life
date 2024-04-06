'use client'

import { useState } from 'react';

import { Asset } from '@/api/assets';
import Button from '@/components/button';
import { Switch } from '@mui/material';
import Input, { InputProps } from '@/components/input';
import { SelectOption } from '@/components/input/select-input';
import { useForm } from 'react-hook-form';

interface OverviewTabProps {
  asset: Asset;
}
interface UpdateAssetFormFields {
  assetClass: string;
  category: string;
  sector: string;
  ticker: string;
  active: boolean;
}

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

export default function OverviewTab({ asset }: OverviewTabProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { control, formState: { errors }, getValues, handleSubmit, reset } = useForm<UpdateAssetFormFields>({
    defaultValues: {
      assetClass: asset.class,
      category: asset.category,
      sector: asset.sector,
      ticker: asset.ticker
    }
  });
  const rows: [string, string][] = [
    ['Ticker', asset.ticker],
    ['Categoria', asset.category],
    ['Classe', asset.class],
    ['Setor', asset.sector]
  ];
  const inputConfigs: InputProps[] = [
    {
      name: 'ticker',
      placeholder: 'Ticker',
      type: 'text',
      control,
      errors,
      validationRules: { required: 'Ticker é obrigatório' }
    },
    {
      name: 'category',
      placeholder: 'Categoria',
      type: 'select',
      control,
      errors,
      options: categoryInputOptions,
      validationRules: { required: 'Categoria é obrigatório' }
    },
    {
      name: 'assetClass',
      placeholder: 'Classe',
      type: 'select',
      control,
      errors,
      options: assetClassInputOptions,
      validationRules: { required: 'Classe é obrigatório' }
    },
    {
      name: 'sector',
      placeholder: 'Setor',
      type: 'text',
      control,
      errors,
      validationRules: { required: 'Setor é obrigatório' }
    }
  ];
  const handleFormSubmit = (data: UpdateAssetFormFields) => {
    console.log(data);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col gap-6"
    >
      {inputConfigs.map((inputConfig) => (
        <div
          key={inputConfig.name}
          className="border-b border-white/[.1] pb-6 flex items-center gap-24"
        >
          <span className="w-1/12 font-bold">
            {inputConfig.placeholder}:
          </span>
          {isEditing ?
            <Input
              name={inputConfig.name}
              placeholder={inputConfig.placeholder}
              type={inputConfig.type}
              control={inputConfig.control}
              errors={inputConfig.errors}
              options={inputConfig.options}
              validationRules={inputConfig.validationRules}
            /> :
            <span className="text-white/[.6]">
              {getValues(inputConfig.name as keyof UpdateAssetFormFields)}
            </span>
          }
        </div>
      ))}

      <div className="border-b border-white/[.1] pb-6 flex items-center gap-24">
        <span className="w-1/12 font-bold">Ativo:</span>
        <Switch disabled checked={asset.active} />
      </div>

      <div className="flex justify-end">
        <Button
          color="primary"
          label={isEditing ? "Salvar" : "Editar"}
          onClick={() => setIsEditing(!isEditing)}
          variant="contained"
        />
      </div>
    </form>
  );
}
