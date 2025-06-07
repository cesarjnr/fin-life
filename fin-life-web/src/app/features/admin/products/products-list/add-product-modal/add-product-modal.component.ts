import {
  Component,
  inject,
  output,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { AssetsService } from '../../../../../core/services/assets.service';
import {
  Asset,
  AssetCategories,
  AssetClasses,
  AssetCurrencies,
  CreateAssetDto,
} from '../../../../../core/dtos/asset.dto';

@Component({
  selector: 'app-add-product-modal',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './add-product-modal.component.html',
  styleUrl: './add-product-modal.component.scss',
})
export class AddProductModalComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly assetsService = inject(AssetsService);

  public readonly addProductModalContentTemplate = viewChild<TemplateRef<any>>(
    'addProductModalContentTemplate',
  );
  public readonly addProductModalActionsTemplate = viewChild<TemplateRef<any>>(
    'addProductModalActionsTemplate',
  );
  public readonly cancelCreateProduct = output<void>();
  public readonly createProduct = output<Asset>();
  public readonly productForm = this.formBuilder.group({
    ticker: this.formBuilder.control('', Validators.required),
    category: this.formBuilder.control('', Validators.required),
    assetClass: this.formBuilder.control('', Validators.required),
    sector: this.formBuilder.control('', Validators.required),
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
      label: AssetCurrencies.BRL,
      value: AssetCurrencies.BRL,
    },
    {
      label: AssetCurrencies.USD,
      value: AssetCurrencies.USD,
    },
  ];

  public handleCancelButtonClick(): void {
    this.cancelCreateProduct.emit();
  }

  public handleConfirmButtonClick(): void {
    const formValues = this.productForm.value as CreateAssetDto;

    this.assetsService.create(formValues).subscribe({
      next: (asset) => {
        this.createProduct.emit(asset);
      },
    });
  }
}
