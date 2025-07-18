import { Component, input } from '@angular/core';

export interface OverviewCardInput {
  title: string;
  rawValue: number;
  formattedValue: string;
  addValueIndicatorStyle: boolean;
}

@Component({
  selector: 'app-overview-card',
  imports: [],
  templateUrl: './overview-card.component.html',
  styleUrl: './overview-card.component.scss',
})
export class OverviewCardComponent {
  public readonly overviewCardData = input.required<OverviewCardInput>();
}
