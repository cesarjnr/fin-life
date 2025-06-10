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
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { BuysSellsService } from '../../../../core/services/buys-sells.service';
import { BuySell, BuySellTypes, CreateBuySellDto } from '../../../../core/dtos/buy-sell.dto';
import { Asset } from '../../../../core/dtos/asset.dto';

interface BuySellForm {
  assetId: FormControl<string | null>;
  date: FormControl<string | null>;
  fees: FormControl<string | null>;
  institution: FormControl<string | null>;
  price: FormControl<string | null>;
  quantity: FormControl<string | null>;
  type: FormControl<string | null>;
}

@Component({
  selector: 'app-buy-sell-modal',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './buy-sell-modal.component.html',
  styleUrl: './buy-sell-modal.component.scss',
})
export class BuySellModalComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly buysSellsService = inject(BuysSellsService);

  public readonly buySellModalContentTemplate = viewChild<TemplateRef<any>>(
    'buySellModalContentTemplate',
  );
  public readonly buySellModalActionsTemplate = viewChild<TemplateRef<any>>(
    'buySellModalActionsTemplate',
  );
  public readonly buySell = input<BuySell>();
  public readonly assets = input<Asset[]>([]);
  public readonly cancelModal = output<void>();
  public readonly saveBuySell = output<BuySell>();
  public readonly buySellForm = this.formBuilder.group<BuySellForm>({
    assetId: this.formBuilder.control('', Validators.required),
    date: this.formBuilder.control('', Validators.required),
    fees: this.formBuilder.control(''),
    institution: this.formBuilder.control('', Validators.required),
    price: this.formBuilder.control('', Validators.required),
    quantity: this.formBuilder.control('', Validators.required),
    type: this.formBuilder.control('', Validators.required),
  });
  public readonly typeInputOptions = [
    { label: 'Compra', value: BuySellTypes.Buy },
    { label: 'Venda', value: BuySellTypes.Sell },
  ];
  public assetInputOptions: { label: string; value: number }[] = [];

  constructor() {
    effect(() => {
      console.log(this.assets());
    });

    effect(() => {
      const buySell = this.buySell();

      if (buySell) {
        this.buySellForm.setValue({
          assetId: String(buySell.assetId),
          date: buySell.date,
          fees: buySell.fees ? String(buySell.fees) : '',
          institution: buySell.institution,
          price: String(buySell.price),
          quantity: String(buySell.quantity),
          type: buySell.type,
        });
      }
    });
  }

  public handleCancelButtonClick(): void {
    this.buySellForm.reset();
    this.cancelModal.emit();
  }

  public handleConfirmButtonClick(): void {
    console.log(this.buySellForm.value);
    // const formValues = this.buySellForm.value as CreateBuySellDto;

    // (this.asset()
    //   ? this.assetsService.update(this.asset()!.id, formValues)
    //   : this.assetsService.create(formValues)
    // ).subscribe({
    //   next: (asset) => {
    //     this.saveProduct.emit(asset);
    //     this.productForm.reset();
    //   },
    // });
  }
}
