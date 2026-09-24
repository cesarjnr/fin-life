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
// import { defer, iif } from 'rxjs';

import { PortfoliosAssetsEventsService } from '../../../../../../core/services/portfolios-assets-events.service';
import { AuthService } from '../../../../../../core/services/auth.service';
import { PortfolioAsset } from '../../../../../../core/dtos/portfolio-asset.dto';
import {
  PortfolioAssetEvent,
  PortfolioAssetEventTypes,
} from '../../../../../../core/dtos/portfolio-asset-event.dto';
import { CommonService } from '../../../../../../core/services/common.service';
import { parseMonetaryValue } from '../../../../../../shared/utils/number';
import { formatDate, parseDate } from '../../../../../../shared/utils/date';

interface EventForm {
  date: FormControl<Date | null>;
  type: FormControl<string | null>;
  quantity: FormControl<string | null>;
  value: FormControl<string | null>;
  withdrawalDate: FormControl<Date | null>;
}

@Component({
  selector: 'app-portfolio-asset-event-modal',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatButtonModule,
    NgxMaskDirective,
  ],
  templateUrl: './portfolio-asset-event-modal.component.html',
  styleUrl: './portfolio-asset-event-modal.component.scss',
  standalone: true,
})
export class PortfolioAssetEventModalComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly toastrService = inject(ToastrService);
  private readonly portfoliosAssetsEventsService = inject(
    PortfoliosAssetsEventsService,
  );
  private readonly authService = inject(AuthService);
  private readonly commonService = inject(CommonService);

  public portfolioAsset = input<PortfolioAsset>();
  public event = input<PortfolioAssetEvent>();
  public readonly cancelModal = output<void>();
  public readonly saveEvent = output<void>();
  public readonly eventModalContentTemplate = viewChild<TemplateRef<any>>(
    'eventModalContentTemplate',
  );
  public readonly eventModalActionsTemplate = viewChild<TemplateRef<any>>(
    'eventModalActionsTemplate',
  );
  public readonly eventForm = this.formBuilder.group<EventForm>({
    date: new FormControl<Date | null>(null, Validators.required),
    type: new FormControl<string | null>(null, Validators.required),
    quantity: new FormControl<string | null>(null, Validators.required),
    value: new FormControl<string | null>(null),
    withdrawalDate: new FormControl<Date | null>(null),
  });
  public readonly typeInputOptions = [
    {
      label: PortfolioAssetEventTypes.Dividend,
      value: PortfolioAssetEventTypes.Dividend,
    },
    {
      label: PortfolioAssetEventTypes.JCP,
      value: PortfolioAssetEventTypes.JCP,
    },
    {
      label: PortfolioAssetEventTypes.Income,
      value: PortfolioAssetEventTypes.Income,
    },
    {
      label: PortfolioAssetEventTypes.FractionalAuction,
      value: PortfolioAssetEventTypes.FractionalAuction,
    },
    {
      label: PortfolioAssetEventTypes.Bonus,
      value: PortfolioAssetEventTypes.Bonus,
    },
  ];

  constructor() {
    effect(() => {
      const event = this.event();

      if (event) {
        this.eventForm.setValue({
          date: parseDate(event.date),
          type: event.type,
          quantity: event.quantity.toString(),
          value: event.value.toString(),
          withdrawalDate: event.withdrawalDate
            ? parseDate(event.withdrawalDate)
            : null,
        });
      }
    });
  }

  public handleCancelButtonClick(): void {
    this.eventForm.reset();
    this.cancelModal.emit();
  }

  public handleConfirmButtonClick(): void {
    const loggedUser = this.authService.getLoggedUser()!;
    const defaultPortfolio = loggedUser.portfolios.find(
      (portfolio) => portfolio.default,
    )!;
    const formValues = this.eventForm.value;
    const portfolioAssetDividendDto = {
      date: formatDate(formValues.date!, 'yyyy-MM-dd'),
      type: formValues.type! as PortfolioAssetEventTypes,
      quantity: Number(formValues.quantity!),
      value: parseMonetaryValue(formValues.value!),
      withdrawalDate: formValues.withdrawalDate
        ? formatDate(formValues.withdrawalDate, 'yyyy-MM-dd')
        : undefined,
    };

    this.commonService.setLoading(true);
    // iif(
    //   () => !!this.event(),
    //   defer(() =>
    //     this.portfoliosAssetsEventsService.update(
    //       defaultPortfolio.id,
    //       this.portfolioAsset()!.id,
    //       this.event()!.id,
    //       portfolioAssetDividendDto,
    //     ),
    //   ),
    //   defer(() =>
    //     this.portfoliosAssetsEventsService.create(
    //       defaultPortfolio.id,
    //       this.portfolioAsset()!.id,
    //       portfolioAssetDividendDto,
    //     ),
    //   ),
    // )
    this.portfoliosAssetsEventsService
      .create(
        defaultPortfolio.id,
        this.portfolioAsset()!.id,
        portfolioAssetDividendDto,
      )
      .subscribe({
        next: () => {
          this.saveEvent.emit();
          this.eventForm.reset();
          this.toastrService.success('Provento salvo com sucesso');
          this.commonService.setLoading(false);
        },
      });
  }
}
