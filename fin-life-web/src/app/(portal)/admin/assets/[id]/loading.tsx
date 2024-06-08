import { assetTabs } from './page';
import Tab from '@/components/tab';
import Table from '@/components/table';

export default function AssetDetailsSkeleton() {
  return (
    <div className="flex-1">
      <div className="bg-black-800 rounded-lg">
        <Tab tabs={assetTabs}>
          <Table
            isLoading={true}
            headers={['Data', 'Preço']}
            name="assetDetails"
            rowsData={[]}
          />
        </Tab>
      </div>
    </div>
  )
}
