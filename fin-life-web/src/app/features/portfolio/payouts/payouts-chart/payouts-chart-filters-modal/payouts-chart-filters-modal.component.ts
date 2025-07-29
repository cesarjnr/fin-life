import {
  Component,
  computed,
  inject,
  input,
  output,
  Signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';

import { PortfolioAsset } from '../../../../../core/dtos/portfolio-asset.dto';
import {
  ChartGroupByPeriods,
  GetChartDataDto,
} from '../../../../../core/dtos/chart.dto';
import { removeNullishValues } from '../../../../../shared/utils/form';
import { format } from 'date-fns';

interface AssetInputOption {
  label: string;
  value: number | null;
}
interface PayoutsChartFiltersForm {
  groupBy: FormControl<ChartGroupByPeriods | null>;
  assetId: FormControl<number | null>;
  start: FormControl<Date | null>;
  end: FormControl<Date | null>;
}
interface PayoutsChartFiltersFormValue {
  groupBy?: ChartGroupByPeriods | null;
  assetId?: number | null;
  start?: Date | null;
  end?: Date | null;
}

@Component({
  selector: 'app-payouts-chart-filters-modal',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
  ],
  templateUrl: './payouts-chart-filters-modal.component.html',
  styleUrl: './payouts-chart-filters-modal.component.scss',
})
export class PayoutsChartFiltersModalComponent {
  private readonly formBuilder = inject(FormBuilder);

  public readonly portfoliosAssets = input<PortfolioAsset[]>([]);
  public readonly cancelModal = output<void>();
  public readonly confirmFilters =
    output<Omit<GetChartDataDto, 'portfolioId'>>();
  public readonly assetInputOptions: Signal<AssetInputOption[]> = computed(
    () => {
      const inputOptions: AssetInputOption[] = this.portfoliosAssets().map(
        (portfolioAsset) => ({
          label: portfolioAsset.asset.ticker,
          value: portfolioAsset.asset.id,
        }),
      );

      inputOptions.unshift({ label: '', value: null });

      return inputOptions;
    },
  );
  public readonly payoutsChartFiltersModalContentTemplate = viewChild<
    TemplateRef<any>
  >('payoutsChartFiltersModalContentTemplate');
  public readonly payoutsChartFiltersModalActionsTemplate = viewChild<
    TemplateRef<any>
  >('payoutsChartFiltersModalActionsTemplate');
  public readonly groupByInputOptions = [
    { label: 'Ano', value: ChartGroupByPeriods.Year },
    { label: 'Mês', value: ChartGroupByPeriods.Month },
    { label: 'Dia', value: ChartGroupByPeriods.Day },
  ];
  public readonly payoutsChartFiltersForm =
    this.formBuilder.group<PayoutsChartFiltersForm>({
      groupBy: this.formBuilder.control(ChartGroupByPeriods.Year),
      assetId: this.formBuilder.control(null),
      start: this.formBuilder.control(null),
      end: this.formBuilder.control(null),
    });

  public handleCancelButtonClick(): void {
    this.cancelModal.emit();
  }

  public handleConfirmButtonClick(): void {
    const formValue = removeNullishValues<PayoutsChartFiltersFormValue>(
      this.payoutsChartFiltersForm.value,
    );

    this.confirmFilters.emit({
      ...formValue,
      start: formValue.start
        ? format(formValue.start, 'yyyy-MM-dd')
        : undefined,
      end: formValue.end ? format(formValue.end, 'yyyy-MM-dd') : undefined,
    });
  }
}
