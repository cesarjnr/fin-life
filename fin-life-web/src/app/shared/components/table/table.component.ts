import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort, SortDirection } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

export interface TableHeader {
  key: string;
  sortInitialDirection?: SortDirection;
  value: string | number;
}
export interface PaginatorConfig {
  length: number;
  pageIndex: number;
  pageSize: number;
}
export interface TableAction {
  name: TableActionNames;
  row: TableRow;
}

export type TableRow = Record<string, any>;

export enum TableActionNames {
  Delete = 'delete',
}

@Component({
  selector: 'app-table',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent {
  public readonly headers = input<TableHeader[]>([]);
  public readonly dataSource = input<TableRow[]>([]);
  public readonly clickableRows = input<boolean>(false);
  public readonly paginatorConfig = input<PaginatorConfig>();
  public readonly sortClick = output<Sort>();
  public readonly rowClick = output<TableRow>();
  public readonly pageClick = output<PageEvent>();
  public readonly actionButtonClick = output<TableAction>();
  public readonly tableActionNames = TableActionNames;

  public get displayedColumns(): string[] {
    return this.headers().map((header) => header.key);
  }

  public handleSortChange(event: Sort): void {
    if (event.direction) {
      this.sortClick.emit(event);
    }
  }

  public handleActionButtonClick(
    event: MouseEvent,
    action: TableActionNames,
    row: TableRow,
  ): void {
    event.stopImmediatePropagation();
    this.actionButtonClick.emit({ name: action, row });
  }

  public handleRowClick(row: TableRow): void {
    this.rowClick.emit(row);
  }

  public handlePageClick(event: PageEvent): void {
    this.pageClick.emit(event);
  }
}
