import {
  Component,
  inject,
  input,
  output,
  TemplateRef,
  viewChild,
  effect,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';
import { NgxMaskDirective } from 'ngx-mask';
import { defer, iif } from 'rxjs';

import { PayoutsService } from '../../../../../../core/services/payouts.service';
import { AuthService } from '../../../../../../core/services/auth.service';
import { PortfolioAsset } from '../../../../../../core/dtos/portfolio-asset.dto';
import { Payout, PayoutTypes } from '../../../../../../core/dtos/payout.dto';
import { CommonService } from '../../../../../../core/services/common.service';
import { parseMonetaryValue } from '../../../../../../shared/utils/number';
import { formatDate, parseDate } from '../../../../../../shared/utils/date';

interface PayoutDividendForm {
  date: FormControl<Date | null>;
  type: FormControl<string | null>;
  quantity: FormControl<string | null>;
  value: FormControl<string | null>;
  withdrawalDate: FormControl<Date | null>;
}

@Component({
  selector: 'app-portfolio-asset-payout-modal',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatButtonModule,
    NgxMaskDirective,
  ],
  templateUrl: './portfolio-asset-payout-modal.component.html',
  styleUrl: './portfolio-asset-payout-modal.component.scss',
  standalone: true,
})
export class PortfolioAssetPayoutModalComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly toastrService = inject(ToastrService);
  private readonly payoutsService = inject(PayoutsService);
  private readonly authService = inject(AuthService);
  private readonly commonService = inject(CommonService);

  public portfolioAsset = input<PortfolioAsset>();
  public payout = input<Payout>();
  public readonly cancelModal = output<void>();
  public readonly savePayout = output<void>();
  public readonly payoutModalContentTemplate = viewChild<TemplateRef<any>>(
    'payoutModalContentTemplate',
  );
  public readonly payoutModalActionsTemplate = viewChild<TemplateRef<any>>(
    'payoutModalActionsTemplate',
  );
  public readonly payoutForm = this.formBuilder.group<PayoutDividendForm>({
    date: new FormControl<Date | null>(null, Validators.required),
    type: new FormControl<string | null>(null, Validators.required),
    quantity: new FormControl<string | null>(null, Validators.required),
    value: new FormControl<string | null>(null, Validators.required),
    withdrawalDate: new FormControl<Date | null>(null),
  });
  public readonly typeInputOptions = [
    { label: 'Dividendo', value: PayoutTypes.Dividend },
    { label: 'JCP', value: PayoutTypes.JCP },
    { label: 'Rendimento', value: PayoutTypes.Income },
  ];

  constructor() {
    effect(() => {
      const payout = this.payout();

      if (payout) {
        this.payoutForm.setValue({
          date: parseDate(payout.date),
          type: payout.type,
          quantity: payout.quantity.toString(),
          value: payout.value.toString(),
          withdrawalDate: payout.withdrawalDate
            ? parseDate(payout.withdrawalDate)
            : null,
        });
      }
    });
  }

  public handleCancelButtonClick(): void {
    this.payoutForm.reset();
    this.cancelModal.emit();
  }

  public handleConfirmButtonClick(): void {
    const loggedUser = this.authService.getLoggedUser()!;
    const defaultPortfolio = loggedUser.portfolios.find(
      (portfolio) => portfolio.default,
    )!;
    const formValues = this.payoutForm.value;
    const portfolioAssetDividendDto = {
      date: formatDate(formValues.date!, 'yyyy-MM-dd'),
      type: formValues.type! as PayoutTypes,
      quantity: Number(formValues.quantity!),
      value: parseMonetaryValue(formValues.value!),
      withdrawalDate: formValues.withdrawalDate
        ? formatDate(formValues.withdrawalDate, 'yyyy-MM-dd')
        : undefined,
    };

    this.commonService.setLoading(true);
    iif(
      () => !!this.payout(),
      defer(() =>
        this.payoutsService.update(
          defaultPortfolio.id,
          this.portfolioAsset()!.id,
          this.payout()!.id,
          portfolioAssetDividendDto,
        ),
      ),
      defer(() =>
        this.payoutsService.create(
          defaultPortfolio.id,
          this.portfolioAsset()!.id,
          portfolioAssetDividendDto,
        ),
      ),
    ).subscribe({
      next: () => {
        this.savePayout.emit();
        this.payoutForm.reset();
        this.toastrService.success('Provento salvo com sucesso');
        this.commonService.setLoading(false);
      },
    });
  }
}
