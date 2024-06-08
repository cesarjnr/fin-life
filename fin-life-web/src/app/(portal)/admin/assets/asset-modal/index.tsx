import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { SelectOption } from "@/components/input/select-input";
import { createAsset, updateAsset } from "@/app/actions/assets";
import { Asset, AssetCategories, AssetClasses, PutAsset } from '@/app/actions/assets/asset.types';
import Modal from "@/components/modal";
import Input from "@/components/input";
import Button from "@/components/button";

interface AssetModalProps {
  asset?: Asset;
  title: string;
  onCancel: () => void;
  onFinish: (asset: Asset) => void;
}
interface AssetFormFields {
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

export default function AssetModal({ asset, title, onCancel, onFinish }: AssetModalProps) {
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const { control, formState: { errors }, handleSubmit, reset } = useForm<AssetFormFields>({
    defaultValues: {
      assetClass: asset?.class || '',
      category: asset?.category || '',
      sector: asset?.sector || '',
      ticker: asset?.ticker || ''
    }
  });
  const handleFormSubmit = async (data: AssetFormFields) => {
    const assetData: PutAsset = {
      assetClass: data.assetClass as AssetClasses,
      category: data.category as AssetCategories,
      sector: data.sector,
      ticker: data.ticker
    };

    setIsButtonLoading(true);

    try {
      const returnedAsset = await (asset?.id ? updateAsset(asset.id, assetData) : createAsset(assetData));
      const action = asset?.id ? 'atualizado' : 'adicionado';

      onFinish(returnedAsset);
      toast(`Ativo ${action} com sucesso!`, { type: 'success' });
      reset();
    } catch (error: any) {
      toast(error.message, { type: 'error' });
    } finally {
      setIsButtonLoading(false);
    }
  };

  return (
    <Modal title={title}>
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
            <Button label="Cancel" onClick={() => onCancel()} />
          )}
          
          <Button
            label="Confirm"
            type="submit"
            loading={isButtonLoading}
          />
        </div>
      </form>
    </Modal>
  );
}