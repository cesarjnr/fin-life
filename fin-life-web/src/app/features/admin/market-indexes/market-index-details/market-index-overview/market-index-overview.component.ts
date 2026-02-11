import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';

import { CommonService } from '../../../../../core/services/common.service';
import { MarketIndexesService } from '../../../../../core/services/market-indexes.service';
import {
  MarketIndex,
  MarketIndexTypes,
} from '../../../../../core/dtos/market-index.dto';
import {
  formatCurrency,
  formatPercentage,
} from '../../../../../shared/utils/number';
import { Currencies } from '../../../../../core/dtos/common.dto';

@Component({
  selector: 'app-market-index-overview',
  imports: [MatButton, MatIcon],
  templateUrl: './market-index-overview.component.html',
  styleUrl: './market-index-overview.component.scss',
})
export class MarketIndexOverviewComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly toastrService = inject(ToastrService);
  private readonly commonService = inject(CommonService);
  private readonly marketIndexesService = inject(MarketIndexesService);

  public readonly marketIndex = signal<MarketIndex | undefined>(undefined);
  public readonly marketIndexInfoRows = computed(() => {
    const marketIndexInfoRows: [string, string][] = [];
    const marketIndex = this.marketIndex();

    if (marketIndex) {
      const marketIndexLatestValue =
        marketIndex.marketIndexHistoricalData[
          marketIndex.marketIndexHistoricalData.length - 1
        ]?.value ?? 0;

      marketIndexInfoRows.push(
        ['Código', marketIndex.code],
        ['Intervalo', marketIndex.interval],
        ['Tipo', marketIndex.type],
        [
          'Valor Atual',
          marketIndexLatestValue
            ? marketIndex.type === MarketIndexTypes.Currency
              ? formatCurrency(Currencies.BRL, marketIndexLatestValue)
              : formatPercentage(marketIndexLatestValue)
            : '-',
        ],
        [
          'Valor Mais Alto',
          marketIndex.type === MarketIndexTypes.Currency
            ? formatCurrency(Currencies.BRL, marketIndex.allTimeHighValue)
            : formatPercentage(marketIndex.allTimeHighValue),
        ],
      );
    }

    return marketIndexInfoRows;
  });

  public ngOnInit(): void {
    this.findMarketIndex();
  }

  public handleSyncValuesButtonClick(): void {
    this.commonService.setLoading(true);

    const marketIndexId = Number(
      this.activatedRoute.snapshot.paramMap.get('id')!,
    );

    this.marketIndexesService.syncValues({ marketIndexId }).subscribe({
      next: ([marketIndex]) => {
        this.marketIndex.update((currentValue) => {
          const latestValue = marketIndex.marketIndexHistoricalData.length
            ? [
                marketIndex.marketIndexHistoricalData[
                  marketIndex.marketIndexHistoricalData.length - 1
                ],
              ]
            : currentValue!.marketIndexHistoricalData;

          return Object.assign({}, currentValue, marketIndex, {
            marketIndexHistoricalData: latestValue,
          });
        });
        this.toastrService.success('Valores do índice atualizados com sucesso');
        this.commonService.setLoading(false);
      },
    });
  }

  private findMarketIndex(): void {
    this.commonService.setLoading(true);

    const marketIndexId = Number(
      this.activatedRoute.snapshot.paramMap.get('id')!,
    );

    this.marketIndexesService.find(marketIndexId).subscribe({
      next: (marketIndex) => {
        this.marketIndex.set(marketIndex);
        this.commonService.setLoading(false);
      },
    });
  }
}
