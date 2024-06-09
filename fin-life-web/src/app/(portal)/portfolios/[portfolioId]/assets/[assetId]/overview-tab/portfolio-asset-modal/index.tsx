'use client'

import {  useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { PortfolioAsset, UpdatePortfolioAsset } from "@/app/actions/portfolios-assets/portfolio-asset.types";
import { updatePortfolioAsset } from "@/app/actions/portfolios-assets";
import Modal from "@/components/modal";
import Input from "@/components/input";
import Button from "@/components/button";

interface PortfolioAssetModalProps {
  portfolioAsset: PortfolioAsset;
  title: string;
  onCancel: () => void;
  onFinish: () => void;
}
interface PortfolioAssetFormFields {
  characteristic: string;
  expectedPercentage: string;
}

export default function PortfolioAssetModal({
  portfolioAsset,
  title,
  onCancel,
  onFinish
}: PortfolioAssetModalProps) {
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const { control, handleSubmit } = useForm<PortfolioAssetFormFields>({
    defaultValues: {
      characteristic: portfolioAsset.characteristic || '',
      expectedPercentage: portfolioAsset.expectedPercentage ? String(portfolioAsset.expectedPercentage) : ''
    }
  });
  const handleFormSubmit = async (data: PortfolioAssetFormFields) => {
    const portfolioAssetData: UpdatePortfolioAsset = {
      characteristic: data.characteristic,
      expectedPercentage: Number(data.expectedPercentage)
    };

    setIsButtonLoading(true);

    try {
      await updatePortfolioAsset(1, portfolioAsset!.portfolioId, portfolioAsset!.id, portfolioAssetData);
      onFinish();
      toast('Ativo atualizado com sucesso!', { type: 'success' });
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
            name="characteristic"
            placeholder="Característica"
            type="text"
            control={control}
          />
          <Input
            name="expectedPercentage"
            placeholder="% Esperada na Classe"
            type="number"
            control={control}
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