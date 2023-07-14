import { getUserWalletsAssets } from '../../../api/wallets-assets';
import { AssetCategories, AssetClasses } from '../../../api/assets';
import { formatCurrency } from '../../../lib/currency';
import Table, { RowData } from '../../../components/table';

export default async function Portfolio() {
  const walletsAssets = await getUserWalletsAssets(1, 1);
  const assetsCategoriesMap = new Map<AssetCategories, string>([
    [AssetCategories.VariableIncome, 'Renda Variável'],
    [AssetCategories.FixedIncoe, 'Renda Fixa']
  ]);
  const assetsClassesMap = new Map<AssetClasses, string>([
    [AssetClasses.Stock, 'Ação'],
    [AssetClasses.RealState, 'Imobiliário'],
    [AssetClasses.Cash, 'Caixa'],
    [AssetClasses.International, 'Internacional'],
    [AssetClasses.Cryptocurrency, 'Criptomoeda']
  ]);
  const headers = [
    'Ticker',
    'Categoria',
    'Classe',
    'Setor',
    'Característica',
    '% Esperada na Classe',
    'Quantidade',
    'Cotação',
    'Posição'
  ];
  const tableRowsData: RowData[] = walletsAssets
    .filter((walletAsset) => walletAsset.quantity)
    .map((walletAsset) => {
      const data = [
        walletAsset.asset.ticker,
        assetsCategoriesMap.get(walletAsset.asset.category)!,
        assetsClassesMap.get(walletAsset.asset.class)!,
        walletAsset.area || 'N/A',
        walletAsset.characteristic || 'N/A',
        walletAsset.expectedPercentage || 'N/A',
        walletAsset.quantity,
        formatCurrency(walletAsset.asset.assetHistoricalPrices[0].closingPrice),
        formatCurrency(walletAsset.quantity * walletAsset.asset.assetHistoricalPrices[0].closingPrice)
      ];

      return {
        id: walletAsset.id,
        values: data
      }
    });

  return (
    <Table
      title="Aposentadoria"
      headers={headers}
      rowsData={tableRowsData}
    />
  );
}
