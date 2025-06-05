import { Component, inject, TemplateRef, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import {
  AssetCategories,
  AssetClasses,
  AssetCurrencies,
} from '../../../../core/dtos/asset.dto';

@Component({
  selector: 'app-add-product-modal',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './add-product-modal.component.html',
  styleUrl: './add-product-modal.component.scss',
})
export class AddProductModalComponent {
  private readonly formBuilder = inject(FormBuilder);

  public readonly addProductModalContentTemplate = viewChild<TemplateRef<any>>(
    'addProductModalContentTemplate',
  );
  public readonly addProductModalActionsTemplate = viewChild<TemplateRef<any>>(
    'addProductModalActionsTemplate',
  );
  public readonly assetForm = this.formBuilder.group({
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
}
