import {
  Component,
  inject,
  input,
  OnInit,
  output,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';

import { AssetsService } from '../../../core/services/assets.service';
import { UploadInputComponent } from '../../../shared/components/upload-input/upload-input.component';
import { BuysSellsService } from '../../../core/services/buys-sells.service';
import { BuySell } from '../../../core/dtos/buy-sell.dto';
import { AuthService } from '../../../core/services/auth.service';
import { CommonService } from '../../../core/services/common.service';

@Component({
  selector: 'app-import-buys-sells-modal',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    UploadInputComponent,
  ],
  templateUrl: './import-buys-sells-modal.component.html',
  styleUrl: './import-buys-sells-modal.component.scss',
})
export class ImportBuysSellsModalComponent implements OnInit {
  private readonly toastrService = inject(ToastrService);
  private readonly assetsService = inject(AssetsService);
  private readonly buysSellsService = inject(BuysSellsService);
  private readonly authService = inject(AuthService);
  private readonly commonService = inject(CommonService);

  public readonly selectedAsset = input<number>();
  public readonly cancelModal = output<void>();
  public readonly importBuysSells = output<BuySell[]>();
  public readonly importBuysSellsModalContentTemplate = viewChild<
    TemplateRef<any>
  >('importBuysSellsModalContentTemplate');
  public readonly importBuysSellsModalActionsTemplate = viewChild<
    TemplateRef<any>
  >('importBuysSellsModalActionsTemplate');
  public uploadedFile = signal<File | undefined>(undefined);
  public asset = new FormControl<number | null>(null);
  public assetInputOptions: { label: string; value: number }[] = [];

  public ngOnInit(): void {
    this.getAssets();
  }

  public handleUploadFile(files: File[]): void {
    this.uploadedFile.set(files[0]);
  }

  public handleCancelButtonClick(): void {
    this.asset.reset();
    this.cancelModal.emit();
  }

  public handleConfirmButtonClick(): void {
    const loggedUser = this.authService.getLoggedUser()!;
    const defaultPortfolio = loggedUser.portfolios.find(
      (portfolio) => portfolio.default,
    )!;

    this.commonService.setLoading(true);
    this.buysSellsService
      .import(defaultPortfolio.id, {
        assetId: this.asset.value!,
        file: this.uploadedFile()!,
      })
      .subscribe({
        next: (buysSells) => {
          this.importBuysSells.emit(buysSells);
          this.asset.reset({
            value: this.selectedAsset() ?? null,
            disabled: this.selectedAsset() ? true : false,
          });
          this.toastrService.success('Operações importadas com sucesso');
          this.commonService.setLoading(false);
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

        if (this.selectedAsset()) {
          this.asset.setValue(this.selectedAsset()!);
          this.asset.disable();
        }
      },
      error: () => {
        this.cancelModal.emit();
      },
    });
  }
}
