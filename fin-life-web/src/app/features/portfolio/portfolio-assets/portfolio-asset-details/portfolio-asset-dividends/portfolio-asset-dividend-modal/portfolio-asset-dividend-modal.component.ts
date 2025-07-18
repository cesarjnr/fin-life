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
import { format } from 'date-fns';
import { defer, iif } from 'rxjs';

import { PortfoliosAssetsDividendsService } from '../../../../../../core/services/portfolios-assets-dividends.service';
import { AuthService } from '../../../../../../core/services/auth.service';
import { PortfolioAsset } from '../../../../../../core/dtos/portfolio-asset.dto';
import {
  PortfolioAssetDividend,
  PortfolioAssetDividendTypes,
} from '../../../../../../core/dtos/portfolio-asset-dividend.dto';
import { CommonService } from '../../../../../../core/services/common.service';
import { parseMonetaryValue } from '../../../../../../shared/utils/number';

interface PortfolioAssetDividendForm {
  date: FormControl<Date | null>;
  type: FormControl<string | null>;
  quantity: FormControl<string | null>;
  value: FormControl<string | null>;
}
export interface PortfolioAssetDividendFormValues {
  date: Date | null;
  type: string | null;
  quantity: string | null;
  value: string | null;
}

@Component({
  selector: 'app-portfolio-asset-dividend-modal',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatButtonModule,
    NgxMaskDirective,
  ],
  templateUrl: './portfolio-asset-dividend-modal.component.html',
  styleUrl: './portfolio-asset-dividend-modal.component.scss',
  standalone: true,
})
export class PortfolioAssetDividendModalComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly toastrService = inject(ToastrService);
  private readonly portfoliosAssetsDividendsService = inject(
    PortfoliosAssetsDividendsService,
  );
  private readonly authService = inject(AuthService);
  private readonly commonService = inject(CommonService);

  public portfolioAsset = input<PortfolioAsset>();
  public portfolioAssetDividend = input<PortfolioAssetDividend>();
  public readonly cancelModal = output<void>();
  public readonly savePortfolioAssetDividend = output<void>();
  public readonly portfolioAssetDividendModalContentTemplate = viewChild<
    TemplateRef<any>
  >('portfolioAssetDividendModalContentTemplate');
  public readonly portfolioAssetDividendModalActionsTemplate = viewChild<
    TemplateRef<any>
  >('portfolioAssetDividendModalActionsTemplate');
  public readonly portfolioAssetDividendForm =
    this.formBuilder.group<PortfolioAssetDividendForm>({
      date: new FormControl<Date | null>(null, Validators.required),
      type: new FormControl<string | null>(null, Validators.required),
      quantity: new FormControl<string | null>(null, Validators.required),
      value: new FormControl<string | null>(null, Validators.required),
    });
  public readonly typeInputOptions = [
    { label: 'Dividendo', value: PortfolioAssetDividendTypes.Dividend },
    { label: 'JCP', value: PortfolioAssetDividendTypes.JCP },
    { label: 'Rendimento', value: PortfolioAssetDividendTypes.Income },
  ];

  constructor() {
    effect(() => {
      const portfolioAssetDividend = this.portfolioAssetDividend();

      if (portfolioAssetDividend) {
        this.portfolioAssetDividendForm.setValue({
          date: new Date(portfolioAssetDividend.date + 'T00:00:00.000'),
          type: portfolioAssetDividend.type,
          quantity: portfolioAssetDividend.quantity.toString(),
          value: portfolioAssetDividend.value.toString(),
        });
      }
    });
  }

  public handleCancelButtonClick(): void {
    this.portfolioAssetDividendForm.reset();
    this.cancelModal.emit();
  }

  public handleConfirmButtonClick(): void {
    const loggedUser = this.authService.getLoggedUser()!;
    const defaultPortfolio = loggedUser.portfolios.find(
      (portfolio) => portfolio.default,
    )!;
    const formValues = this.portfolioAssetDividendForm.value;
    const portfolioAssetDividendDto = {
      date: format(formValues.date!, 'yyyy-MM-dd'),
      type: formValues.type! as PortfolioAssetDividendTypes,
      quantity: Number(formValues.quantity!),
      value: parseMonetaryValue(formValues.value!),
    };

    this.commonService.setLoading(true);
    iif(
      () => !!this.portfolioAssetDividend(),
      defer(() =>
        this.portfoliosAssetsDividendsService.update(
          defaultPortfolio.id,
          this.portfolioAsset()!.id,
          this.portfolioAssetDividend()!.id,
          portfolioAssetDividendDto,
        ),
      ),
      defer(() =>
        this.portfoliosAssetsDividendsService.create(
          defaultPortfolio.id,
          this.portfolioAsset()!.id,
          portfolioAssetDividendDto,
        ),
      ),
    ).subscribe({
      next: () => {
        this.savePortfolioAssetDividend.emit();
        this.portfolioAssetDividendForm.reset();
        this.toastrService.success('Provento salvo com sucesso');
        this.commonService.setLoading(false);
      },
    });
  }
}
