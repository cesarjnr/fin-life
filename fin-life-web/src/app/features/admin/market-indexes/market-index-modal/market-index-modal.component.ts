import {
  Component,
  effect,
  inject,
  input,
  output,
  TemplateRef,
  viewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import {
  MatDatepickerInput,
  MatDatepickerToggle,
  MatDatepicker,
} from '@angular/material/datepicker';
import { MatButton } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';

import { CommonService } from '../../../../core/services/common.service';
import { MarketIndexesService } from '../../../../core/services/market-indexes.service';
import {
  CreateMarketIndexDto,
  DateIntervals,
  MarketIndex,
  MarketIndexTypes,
} from '../../../../core/dtos/market-index.dto';

interface MarketIndexForm {
  code: FormControl<string | null>;
  interval: FormControl<string | null>;
  type: FormControl<string | null>;
  from?: FormControl<Date | null>;
  to?: FormControl<Date | null>;
  active?: FormControl<boolean | null>;
}

@Component({
  selector: 'app-market-index-modal',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatError,
    MatSelect,
    MatOption,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    MatButton,
  ],
  templateUrl: './market-index-modal.component.html',
  styleUrl: './market-index-modal.component.scss',
})
export class MarketIndexModalComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly toastrService = inject(ToastrService);
  private readonly commonService = inject(CommonService);
  private readonly marketIndexesService = inject(MarketIndexesService);

  public readonly marketIndexModalContentTemplate = viewChild<TemplateRef<any>>(
    'marketIndexModalContentTemplate',
  );
  public readonly marketIndexModalActionsTemplate = viewChild<TemplateRef<any>>(
    'marketIndexModalActionsTemplate',
  );
  public readonly marketIndex = input<MarketIndex>();
  public readonly cancel = output<void>();
  public readonly confirm = output<MarketIndex>();
  public readonly marketIndexForm = this.formBuilder.group<MarketIndexForm>({
    code: this.formBuilder.control(null, Validators.required),
    interval: this.formBuilder.control(null, Validators.required),
    type: this.formBuilder.control(null, Validators.required),
  });
  public readonly intervalInputOptions = [
    { label: DateIntervals.Daily, value: DateIntervals.Daily },
    { label: DateIntervals.Monthly, value: DateIntervals.Monthly },
    { label: DateIntervals.Yearly, value: DateIntervals.Yearly },
  ];
  public readonly typeInputOptions = [
    { label: MarketIndexTypes.Currency, value: MarketIndexTypes.Currency },
    { label: MarketIndexTypes.Rate, value: MarketIndexTypes.Rate },
    { label: MarketIndexTypes.Point, value: MarketIndexTypes.Point },
  ];

  constructor() {
    effect(() => {
      const marketIndex = this.marketIndex();

      if (marketIndex) {
        this.marketIndexForm.addControl(
          'active',
          this.formBuilder.control(false),
        );
        this.marketIndexForm.setValue({
          code: marketIndex.code,
          interval: marketIndex.interval,
          type: marketIndex.type,
          active: marketIndex.active,
        });
      } else {
        this.marketIndexForm.addControl('from', this.formBuilder.control(null));
        this.marketIndexForm.addControl('to', this.formBuilder.control(null));
      }
    });
  }

  public handleCancelButtonClick(): void {
    this.marketIndexForm.reset();
    this.cancel.emit();
  }

  public handleConfirmButtonClick(): void {
    const formValues = this.marketIndexForm.value as CreateMarketIndexDto;

    this.commonService.setLoading(true);
    this.marketIndexesService.create(formValues).subscribe({
      next: (marketIndex) => {
        this.confirm.emit(marketIndex);
        this.marketIndexForm.reset();
        this.toastrService.success('Índice de mercado salvo com sucesso');
        this.commonService.setLoading(false);
      },
    });
  }
}
