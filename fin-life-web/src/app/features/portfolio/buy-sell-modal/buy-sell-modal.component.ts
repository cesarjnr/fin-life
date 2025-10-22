import {
  Component,
  inject,
  input,
  OnInit,
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgxMaskDirective } from 'ngx-mask';
import { ToastrService } from 'ngx-toastr';
import { format } from 'date-fns';

import { BuysSellsService } from '../../../core/services/buys-sells.service';
import { BuySellTypes } from '../../../core/dtos/buy-sell.dto';
import { AssetsService } from '../../../core/services/assets.service';
import { AuthService } from '../../../core/services/auth.service';
import { parseMonetaryValue } from '../../../shared/utils/number';

interface BuySellForm {
  assetId: FormControl<number | null>;
  date: FormControl<Date | null>;
  fees: FormControl<string | null>;
  institution: FormControl<string | null>;
  price: FormControl<string | null>;
  quantity: FormControl<string | null>;
  type: FormControl<string | null>;
}
export interface BuySellFormValues {
  assetId: number | null;
  date: Date | null;
  fees: string | null;
  institution: string | null;
  price: string | null;
  quantity: string | null;
  type: string | null;
}

@Component({
  selector: 'app-buy-sell-modal',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    NgxMaskDirective,
  ],
  templateUrl: './buy-sell-modal.component.html',
  styleUrl: './buy-sell-modal.component.scss',
})
export class BuySellModalComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly assetsService = inject(AssetsService);
  private readonly toastrService = inject(ToastrService);
  private readonly buysSellsService = inject(BuysSellsService);
  private readonly authService = inject(AuthService);

  public readonly assetId = input<number | null>();
  public readonly cancelModal = output<void>();
  public readonly saveBuySell = output<void>();
  public readonly buySellModalContentTemplate = viewChild<TemplateRef<any>>(
    'buySellModalContentTemplate',
  );
  public readonly buySellModalActionsTemplate = viewChild<TemplateRef<any>>(
    'buySellModalActionsTemplate',
  );
  public readonly buySellForm = this.formBuilder.group<BuySellForm>({
    assetId: this.formBuilder.control(null, Validators.required),
    date: this.formBuilder.control(null, Validators.required),
    fees: this.formBuilder.control(null),
    institution: this.formBuilder.control(null, Validators.required),
    price: this.formBuilder.control(null, Validators.required),
    quantity: this.formBuilder.control(null, Validators.required),
    type: this.formBuilder.control(null, Validators.required),
  });
  public readonly typeInputOptions = [
    { label: 'Compra', value: BuySellTypes.Buy },
    { label: 'Venda', value: BuySellTypes.Sell },
  ];
  public assetInputOptions: { label: string; value: number }[] = [];
  public inputMaskPrefix = '';
  public inputMaskThousandSeparator = '';

  public ngOnInit(): void {
    this.getAssets();
  }

  public handleCancelButtonClick(): void {
    this.buySellForm.reset();
    this.cancelModal.emit();
  }

  public handleConfirmButtonClick(): void {
    const loggedUser = this.authService.getLoggedUser()!;
    const defaultPortfolio = loggedUser.portfolios.find(
      (portfolio) => portfolio.default,
    )!;
    const formValues = this.buySellForm.getRawValue();

    this.buysSellsService
      .create(defaultPortfolio.id, {
        assetId: formValues.assetId!,
        date: format(formValues.date!, 'yyyy-MM-dd'),
        fees: formValues.fees ? parseMonetaryValue(formValues.fees) : undefined,
        institution: formValues.institution!,
        price: parseMonetaryValue(formValues.price!),
        quantity: Number(formValues.quantity!),
        type: formValues.type! as BuySellTypes,
      })
      .subscribe({
        next: () => {
          this.saveBuySell.emit();
          this.toastrService.success('Operação salva com sucesso');
          this.buySellForm.reset();

          if (this.assetId()) {
            this.buySellForm.controls.assetId.setValue(this.assetId()!);
            this.buySellForm.controls.assetId.disable();
          }
        },
        error: () => {
          this.cancelModal.emit();
        },
      });
  }

  private getAssets(): void {
    this.assetsService.get().subscribe({
      next: (assetsResponse) => {
        this.assetInputOptions = assetsResponse.data.map((asset) => ({
          label: asset.ticker,
          value: asset.id,
        }));

        if (this.assetId()) {
          this.setupFormInitialState();
        }
      },
    });
  }

  private setupFormInitialState(): void {
    this.buySellForm.controls.assetId.setValue(this.assetId()!);
    this.buySellForm.controls.assetId.disable();

    const assetTicker = this.assetInputOptions.find(
      (inputOption) => inputOption.value === this.assetId(),
    )?.label;

    if (assetTicker !== 'BTC') {
      this.inputMaskPrefix = '$';
      this.inputMaskThousandSeparator = ',';
    }
  }
}
