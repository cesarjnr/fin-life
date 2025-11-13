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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';
import { defer, iif } from 'rxjs';

import { AssetsService } from '../../../../core/services/assets.service';
import {
  Asset,
  AssetCategories,
  AssetClasses,
  CreateAssetDto,
} from '../../../../core/dtos/asset.dto';
import { CommonService } from '../../../../core/services/common.service';
import { Currencies } from '../../../../core/dtos/common.dto';

interface ProductForm {
  ticker: FormControl<string | null>;
  category: FormControl<string | null>;
  assetClass: FormControl<string | null>;
  sector: FormControl<string | null>;
  currency: FormControl<string | null>;
  active?: FormControl<boolean | null>;
}

@Component({
  selector: 'app-product-modal',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './product-modal.component.html',
  styleUrl: './product-modal.component.scss',
})
export class ProductModalComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly toastrService = inject(ToastrService);
  private readonly assetsService = inject(AssetsService);
  private readonly commonService = inject(CommonService);

  public readonly productModalContentTemplate = viewChild<TemplateRef<any>>(
    'productModalContentTemplate',
  );
  public readonly productModalActionsTemplate = viewChild<TemplateRef<any>>(
    'productModalActionsTemplate',
  );
  public readonly asset = input<Asset>();
  public readonly cancelModal = output<void>();
  public readonly saveProduct = output<Asset>();
  public readonly productForm = this.formBuilder.group<ProductForm>({
    ticker: this.formBuilder.control('', Validators.required),
    category: this.formBuilder.control('', Validators.required),
    assetClass: this.formBuilder.control('', Validators.required),
    sector: this.formBuilder.control(''),
    currency: this.formBuilder.control('', Validators.required),
  });
  public readonly categoryInputOptions = [
    {
      label: AssetCategories.VariableIncome,
      value: AssetCategories.VariableIncome,
    },
    { label: AssetCategories.FixedIncome, value: AssetCategories.FixedIncome },
  ];
  public readonly assetClassInputOptions = [
    {
      label: AssetClasses.Stock,
      value: AssetClasses.Stock,
    },
    { label: AssetClasses.International, value: AssetClasses.International },
    { label: AssetClasses.RealState, value: AssetClasses.RealState },
    { label: AssetClasses.Cash, value: AssetClasses.Cash },
    { label: AssetClasses.Cryptocurrency, value: AssetClasses.Cryptocurrency },
  ];
  public readonly currencyInputOptions = [
    {
      label: Currencies.BRL,
      value: Currencies.BRL,
    },
    {
      label: Currencies.USD,
      value: Currencies.USD,
    },
  ];

  constructor() {
    effect(() => {
      const asset = this.asset();

      if (asset) {
        this.productForm.addControl('active', this.formBuilder.control(false));
        this.productForm.setValue({
          ticker: asset.ticker,
          category: asset.category,
          assetClass: asset.class,
          sector: asset.sector || '',
          currency: asset.currency,
          active: asset.active,
        });
      }
    });
  }

  public handleCancelButtonClick(): void {
    this.productForm.reset();
    this.cancelModal.emit();
  }

  public handleConfirmButtonClick(): void {
    const formValues = this.productForm.value as CreateAssetDto;

    this.commonService.setLoading(true);

    iif(
      () => !!this.asset(),
      defer(() => this.assetsService.update(this.asset()!.id, formValues)),
      defer(() => this.assetsService.create(formValues)),
    ).subscribe({
      next: (asset) => {
        this.saveProduct.emit(asset);
        this.productForm.reset();
        this.toastrService.success('Produto salvo com sucesso');
        this.commonService.setLoading(false);
      },
    });
  }
}
