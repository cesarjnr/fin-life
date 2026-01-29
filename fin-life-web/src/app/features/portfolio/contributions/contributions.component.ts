import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, NgTemplateOutlet, PercentPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';

import { CommonService } from '../../../core/services/common.service';
import { Contribution } from '../../../core/dtos/contributions.dto';
import { ContributionsService } from '../../../core/services/contributions.service';

@Component({
  selector: 'app-contributions',
  imports: [
    CurrencyPipe,
    PercentPipe,
    NgTemplateOutlet,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  templateUrl: './contributions.component.html',
  styleUrls: ['./contributions.component.scss'],
})
export class ContributionsComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly commonService = inject(CommonService);
  private readonly contributionsService = inject(ContributionsService);

  public readonly contributions = signal<Contribution[]>([]);

  public ngOnInit(): void {
    this.getContributions();
  }

  public handleSimulateButtonClick(): void {}

  public progressBarValue(currentValue: number, totalValue: number): number {
    return (currentValue / totalValue) * 100;
  }

  private getContributions(): void {
    const portfolioId = Number(
      this.activatedRoute.snapshot.paramMap.get('portfolioId')!,
    );

    this.commonService.setLoading(true);
    this.contributionsService.get(portfolioId).subscribe({
      next: (contributions) => {
        this.contributions.set(contributions);
        this.commonService.setLoading(false);
      },
    });
  }
}
