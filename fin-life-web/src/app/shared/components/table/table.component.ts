import { Component, input, output } from '@angular/core';
import { MatTableModule } from '@angular/material/table';

export interface TableHeader {
  key: string;
  value: string | number;
}
export type TableRow = Record<string, any>;

@Component({
  selector: 'app-table',
  imports: [MatTableModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent {
  public readonly headers = input<TableHeader[]>([]);
  public readonly dataSource = input<TableRow[]>([]);
  public readonly clickableRows = input<boolean>(false);
  public readonly rowClick = output<TableRow>();

  public get displayedColumns(): string[] {
    return this.headers().map((header) => header.key);
  }

  public handleRowClick(row: TableRow): void {
    this.rowClick.emit(row);
  }
}
