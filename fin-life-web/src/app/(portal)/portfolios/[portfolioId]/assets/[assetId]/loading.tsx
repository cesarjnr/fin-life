import { Skeleton } from "@mui/material";

import { portfolioAssetTabs } from "./page";
import Tab from "@/components/tab";

export default function PortfolioAssetDetailsSkeleton() {
  return (
    <div className="flex-1">
      <div className="bg-black-800 rounded-lg">
        <Tab tabs={portfolioAssetTabs}>
          <div>
            <div className="flex justify-end">
                <Skeleton
                  sx={{ borderRadius: '0.375rem', padding: '0.5rem 1rem' }}
                  width="80px"
                />
            </div>

            <div className="flex flex-col gap-6">
              {Array.from({ length: 10 }, (_, index) => (
                <div
                  key={index}
                  className={`${index === 10 ? '' : 'border-b border-white/[.1]'} pb-6 flex items-center gap-24`}
                >
                  <Skeleton width="97px" />
                  <Skeleton width="97px" />
                </div>
              ))}
            </div>
          </div>
        </Tab>
      </div>
    </div>
  );
}
