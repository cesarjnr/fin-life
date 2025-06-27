import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
export interface TableAction {
  name: string;
  row: TableRow;
}
export type TableRow = Record<string, any>;

@Component({
  selector: 'app-table',
  imports: [MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule],
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
  public readonly actionButtonClick = output<TableAction>();

  public get displayedColumns(): string[] {
    return this.headers().map((header) => header.key);
  }

  public handleRowClick(row: TableRow): void {
    this.rowClick.emit(row);
  }

  public handlePageClick(event: PageEvent): void {
    this.pageClick.emit(event);
  }

  public handleActionButtonClick(
    event: MouseEvent,
    action: string,
    row: TableRow,
  ): void {
    event.stopImmediatePropagation();
    this.actionButtonClick.emit({ name: action, row });
  }
}
