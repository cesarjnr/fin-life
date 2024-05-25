import Table from '@/components/table';

export const portfolioAssetsTableHeaders = [
  'Ticker',
  'Categoria',
  'Classe',
  'Característica',
  '% Esperada na Classe',
  'Quantidade',
  'Custo',
  'Preço Médio',
  'Cotação',
  'Posição'
];

export default function AssetSkeleton() {
  return (
    <div className="self-center">
      <div className="p-6 rounded-xl bg-black-800 min-w-[50vw]">
        <Table
          isLoading={true}
          headers={portfolioAssetsTableHeaders}
          name="assets"
          rowsData={[]}
        />
      </div>
    </div>
  );
}