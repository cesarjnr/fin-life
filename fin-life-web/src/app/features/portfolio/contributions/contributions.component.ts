import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { CurrencyPipe, NgTemplateOutlet, PercentPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { CommonService } from '../../../core/services/common.service';
import {
  Contribution,
  GetContributionDto,
} from '../../../core/dtos/contributions.dto';
import { ContributionsService } from '../../../core/services/contributions.service';
import { PortfoliosAssetsService } from '../../../core/services/portfolios-assets.service';
import {
  ContributionFiltersFormValues,
  ContributionFiltersModalComponent,
} from './contribution-filters-modal/contribution-filters-modal.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-contributions',
  imports: [
    ReactiveFormsModule,
    CurrencyPipe,
    PercentPipe,
    NgTemplateOutlet,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    ContributionFiltersModalComponent,
  ],
  templateUrl: './contributions.component.html',
  styleUrls: ['./contributions.component.scss'],
})
export class ContributionsComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly toastrService = inject(ToastrService);
  private readonly commonService = inject(CommonService);
  private readonly contributionsService = inject(ContributionsService);
  private readonly portfoliosAssetsService = inject(PortfoliosAssetsService);
  private portfolioId?: number;

  public readonly contributionFiltersModalComponent = viewChild(
    ContributionFiltersModalComponent,
  );
  public readonly contributions = signal<Contribution[]>([]);
  public percentage = new FormControl(0);
  public displayPercentageInputFor?: string = undefined;
  public modalRef?: MatDialogRef<ModalComponent>;

  public ngOnInit(): void {
    this.portfolioId = Number(
      this.activatedRoute.snapshot.paramMap.get('portfolioId')!,
    );

    this.getContributions();
  }

  public handleSimulateButtonClick(): void {
    const contributionFiltersModalComponent =
      this.contributionFiltersModalComponent();

    this.modalRef = this.dialog.open(ModalComponent, {
      autoFocus: 'dialog',
      data: {
        title: 'Simular Aporte',
        contentTemplate:
          contributionFiltersModalComponent?.contributionFiltersModalContentTemplate(),
        actionsTemplate:
          contributionFiltersModalComponent?.contributionFitltersModalActionsTemplate(),
      },
      restoreFocus: false,
    });
  }

  public handleSaveButtonClick(
    portfolioAssetId: number,
    percentageType: 'min' | 'max',
  ): void {
    this.commonService.setLoading(true);
    this.portfoliosAssetsService
      .update(this.portfolioId!, portfolioAssetId, {
        [`${percentageType}Percentage`]: this.percentage.value! / 100,
      })
      .subscribe({
        next: () => {
          this.toastrService.success('Porcentagem atualizada com sucesso');
          this.getContributions();
          this.commonService.setLoading(false);
        },
      });

    this.percentage.setValue(0);
    this.displayPercentageInputFor = undefined;
  }

  public handlePercentageValueClick(
    portfolioAssetId: number,
    percentageType: 'min' | 'max',
    currentExpectedPercentage: number,
  ): void {
    this.percentage.setValue(currentExpectedPercentage * 100);
    this.displayPercentageInputFor = `${portfolioAssetId}-${percentageType}`;
  }

  public getProgressBarValue(currentValue: number, totalValue: number): number {
    return (currentValue / totalValue) * 100;
  }

  public handleApplyFilters(
    contributionFilters: ContributionFiltersFormValues,
  ): void {
    this.getContributions(contributionFilters);
  }

  public closeModal(): void {
    this.modalRef?.close();

    this.modalRef = undefined;
  }

  private getContributions(getContributionsDto?: GetContributionDto): void {
    this.commonService.setLoading(true);
    this.contributionsService
      .get(this.portfolioId!, getContributionsDto)
      .subscribe({
        next: (contributions) => {
          this.contributions.set(contributions);
          this.commonService.setLoading(false);
          this.closeModal();
        },
      });
  }
}
