import { Component, input, output } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';

export interface TableHeader {
  key: string;
  value: string | number;
}
export interface PaginatorConfig {
  length: number;
  pageIndex: number;
  pageSize: number;
}
export type TableRow = Record<string, any>;

@Component({
  selector: 'app-table',
  imports: [MatTableModule, MatPaginatorModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent {
  public readonly headers = input<TableHeader[]>([]);
  public readonly dataSource = input<TableRow[]>([]);
  public readonly clickableRows = input<boolean>(false);
  public readonly paginatorConfig = input<PaginatorConfig>();
  public readonly rowClick = output<TableRow>();
  public readonly pageClick = output<PageEvent>();

  public get displayedColumns(): string[] {
    return this.headers().map((header) => header.key);
  }

  public handleRowClick(row: TableRow): void {
    this.rowClick.emit(row);
  }

  public handlePageClick(event: PageEvent): void {
    this.pageClick.emit(event);
  }
}
