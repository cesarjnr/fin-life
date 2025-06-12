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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import { ToastrService } from 'ngx-toastr';
import { format } from 'date-fns';

import { BuysSellsService } from '../../../../core/services/buys-sells.service';
import { BuySellTypes } from '../../../../core/dtos/buy-sell.dto';
import { Asset } from '../../../../core/dtos/asset.dto';

interface BuySellForm {
  assetId: FormControl<number | null>;
  date: FormControl<Date | null>;
  fees: FormControl<number | null>;
  institution: FormControl<string | null>;
  price: FormControl<number | null>;
  quantity: FormControl<number | null>;
  type: FormControl<string | null>;
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
export class BuySellModalComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toastrService = inject(ToastrService);
  private readonly buysSellsService = inject(BuysSellsService);

  public readonly buySellModalContentTemplate = viewChild<TemplateRef<any>>(
    'buySellModalContentTemplate',
  );
  public readonly buySellModalActionsTemplate = viewChild<TemplateRef<any>>(
    'buySellModalActionsTemplate',
  );
  public readonly assets = input<Asset[]>([]);
  public readonly cancelModal = output<void>();
  public readonly saveBuySell = output<void>();
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

  constructor() {
    effect(() => {
      if (this.assets().length) {
        this.assetInputOptions = this.assets().map((asset) => ({
          label: asset.ticker,
          value: asset.id,
        }));
      }
    });
  }

  public handleCancelButtonClick(): void {
    this.buySellForm.reset();
    this.cancelModal.emit();
  }

  public handleConfirmButtonClick(): void {
    const portfolioId = Number(
      this.activatedRoute.snapshot.paramMap.get('portfolioId')!,
    );
    const formValues = this.buySellForm.value;

    this.buysSellsService
      .create(1, portfolioId, {
        assetId: formValues.assetId!,
        date: format(formValues.date!, 'yyyy-MM-dd'),
        fees: formValues.fees || undefined,
        institution: formValues.institution!,
        price: formValues.price!,
        quantity: formValues.quantity!,
        type: formValues.type! as BuySellTypes,
      })
      .subscribe({
        next: () => {
          this.saveBuySell.emit();
          this.buySellForm.reset();
          this.toastrService.success('Operação salva com sucesso');
        },
      });
  }
}
