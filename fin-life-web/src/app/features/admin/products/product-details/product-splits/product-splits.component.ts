import {
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';

import { SplitHistoricalEventsService } from '../../../../../core/services/split-historical-events.service';
import { SplitHistoricalEvent } from '../../../../../core/dtos/split-historical-event.dto';
import {
  PaginatorConfig,
  TableHeader,
  TableComponent,
} from '../../../../../shared/components/table/table.component';
import { PaginationParams } from '../../../../../core/dtos/pagination.dto';

interface SplitHistoricalEventRowData {
  date: string;
  denominator: number;
  numerator: number;
  ratio: string;
}

@Component({
  selector: 'app-product-splits',
  imports: [TableComponent],
  templateUrl: './product-splits.component.html',
})
export class ProductSplitsComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly splitHistoricalEventsService = inject(
    SplitHistoricalEventsService,
  );
  private readonly splitHistoricalEvents = signal<SplitHistoricalEvent[]>([]);

  public readonly tableData: Signal<SplitHistoricalEventRowData[]> = computed(
    () =>
      this.splitHistoricalEvents().map((splitHistoricalEvent) => ({
        date: splitHistoricalEvent.date,
        denominator: splitHistoricalEvent.denominator,
        numerator: splitHistoricalEvent.numerator,
        ratio: splitHistoricalEvent.ratio,
      })),
  );
  public readonly paginatorConfig = signal<PaginatorConfig | undefined>(
    undefined,
  );
  public readonly tableHeaders: TableHeader[] = [
    { key: 'date', value: 'Data' },
    { key: 'numerator', value: 'Numerador' },
    { key: 'denominator', value: 'Denominador' },
    { key: 'ratio', value: 'Razão' },
  ];

  public ngOnInit(): void {
    this.getProductSplitEvents();
  }

  public handlePageClick(event: PageEvent): void {
    this.getProductSplitEvents({
      limit: event.pageSize,
      page: event.pageIndex,
    });
  }

  private getProductSplitEvents(paginationParams?: PaginationParams): void {
    const assetId = this.activatedRoute.snapshot.params['id'];

    this.splitHistoricalEventsService.get(assetId, paginationParams).subscribe({
      next: (getSplitHistoricalEventsResponse) => {
        const { data, total, page, itemsPerPage } =
          getSplitHistoricalEventsResponse;

        this.splitHistoricalEvents.set(data);
        this.paginatorConfig.set({
          length: total,
          pageIndex: page,
          pageSize: itemsPerPage,
        });
      },
    });
  }
}
