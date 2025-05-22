import { Component, input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';

export interface TableHeader {
  key: string;
  value: string | number;
}
type TableRow = Record<string, any>;

@Component({
  selector: 'app-table',
  imports: [MatTableModule],
  templateUrl: './table.component.html'
})
export class TableComponent {
  public headers = input<TableHeader[]>([]);
  public dataSource = input<TableRow[]>([]);

  public get displayedColumns(): string[] {
    return this.headers().map((header) => header.key);
  }
}
