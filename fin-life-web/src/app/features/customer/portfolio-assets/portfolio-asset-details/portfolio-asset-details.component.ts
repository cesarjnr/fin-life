import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';

import { PortfolioAssetOverviewComponent } from './portfolio-asset-overview/portfolio-asset-overview.component';
import { PortfolioAssetDividendsComponent } from './portfolio-asset-dividends/portfolio-asset-dividends.component';
import { PortfoliosAssetsService } from '../../../../core/services/portfolios-assets.service';
import { PortfolioAsset } from '../../../../core/dtos/portfolio-asset.dto';

@Component({
  selector: 'app-portfolio-asset-details',
  imports: [
    MatTabsModule,
    PortfolioAssetOverviewComponent,
    PortfolioAssetDividendsComponent,
  ],
  templateUrl: './portfolio-asset-details.component.html',
  styleUrl: './portfolio-asset-details.component.scss',
})
export class PortfolioAssetDetailsComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly portfoliosAssetsService = inject(PortfoliosAssetsService);

  public readonly portfolioAsset = signal<PortfolioAsset | undefined>(
    undefined,
  );

  public ngOnInit(): void {
    this.findPortfolioAsset();
  }

  private findPortfolioAsset(): void {
    const portfolioId = Number(
      this.activatedRoute.parent!.snapshot.paramMap.get('portfolioId')!,
    );
    const assetId = Number(
      this.activatedRoute.snapshot.paramMap.get('assetId')!,
    );

    this.portfoliosAssetsService.find(1, portfolioId, assetId).subscribe({
      next: (portfolioAsset) => {
        this.portfolioAsset.set(portfolioAsset);
      },
    });
  }
}
