import {
  Component,
  effect,
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

import { OperationsService } from '../../../core/services/operations.service';
import { AssetsService } from '../../../core/services/assets.service';
import { AuthService } from '../../../core/services/auth.service';
import { parseMonetaryValue } from '../../../shared/utils/number';
import { OperationTypes } from '../../../core/dtos/operation';

interface OperationForm {
  assetId: FormControl<number | null>;
  date: FormControl<Date | null>;
  fees: FormControl<string | null>;
  institution: FormControl<string | null>;
  price: FormControl<string | null>;
  quantity: FormControl<string | null>;
  type: FormControl<string | null>;
}
export interface OperationFormValues {
  assetId: number | null;
  date: Date | null;
  fees: string | null;
  institution: string | null;
  price: string | null;
  quantity: string | null;
  type: string | null;
}

@Component({
  selector: 'app-operation-modal',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    NgxMaskDirective,
  ],
  templateUrl: './operation-modal.component.html',
  styleUrl: './operation-modal.component.scss',
})
export class OperationModalComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly toastrService = inject(ToastrService);
  private readonly assetsService = inject(AssetsService);
  private readonly operationsService = inject(OperationsService);
  private readonly authService = inject(AuthService);

  public readonly assetId = input<number | null>();
  public readonly cancelModal = output<void>();
  public readonly saveOperation = output<void>();
  public readonly operationModalContentTemplate = viewChild<TemplateRef<any>>(
    'operationModalContentTemplate',
  );
  public readonly operationModalActionsTemplate = viewChild<TemplateRef<any>>(
    'operationModalActionsTemplate',
  );
  public readonly operationForm = this.formBuilder.group<OperationForm>({
    assetId: this.formBuilder.control(null, Validators.required),
    date: this.formBuilder.control(null, Validators.required),
    fees: this.formBuilder.control(null),
    institution: this.formBuilder.control(null, Validators.required),
    price: this.formBuilder.control(null, Validators.required),
    quantity: this.formBuilder.control(null, Validators.required),
    type: this.formBuilder.control(null, Validators.required),
  });
  public readonly typeInputOptions = [
    { label: 'Compra', value: OperationTypes.Buy },
    { label: 'Venda', value: OperationTypes.Sell },
  ];
  public assetInputOptions: { label: string; value: number }[] = [];
  public inputMaskPrefix = '';
  public inputMaskThousandSeparator = '';

  constructor() {
    effect(() => {
      if (this.assetId()) {
        this.setupFormInitialState();
      }
    });
  }

  public ngOnInit(): void {
    this.getAssets();
  }

  public handleCancelButtonClick(): void {
    this.operationForm.reset();
    this.cancelModal.emit();
  }

  public handleConfirmButtonClick(): void {
    const loggedUser = this.authService.getLoggedUser()!;
    const defaultPortfolio = loggedUser.portfolios.find(
      (portfolio) => portfolio.default,
    )!;
    const formValues = this.operationForm.getRawValue();

    this.operationsService
      .create(defaultPortfolio.id, {
        assetId: formValues.assetId!,
        date: format(formValues.date!, 'yyyy-MM-dd'),
        fees: formValues.fees ? parseMonetaryValue(formValues.fees) : undefined,
        institution: formValues.institution!,
        price: parseMonetaryValue(formValues.price!),
        quantity: Number(formValues.quantity!),
        type: formValues.type! as OperationTypes,
      })
      .subscribe({
        next: () => {
          this.saveOperation.emit();
          this.toastrService.success('Operação salva com sucesso');
          this.operationForm.reset();

          if (this.assetId()) {
            this.operationForm.controls.assetId.setValue(this.assetId()!);
            this.operationForm.controls.assetId.disable();
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
      },
    });
  }

  private setupFormInitialState(): void {
    this.operationForm.controls.assetId.setValue(this.assetId()!);
    this.operationForm.controls.assetId.disable();

    const assetTicker = this.assetInputOptions.find(
      (inputOption) => inputOption.value === this.assetId(),
    )?.label;

    if (assetTicker !== 'BTC') {
      this.inputMaskPrefix = '$';
      this.inputMaskThousandSeparator = ',';
    }
  }
}
