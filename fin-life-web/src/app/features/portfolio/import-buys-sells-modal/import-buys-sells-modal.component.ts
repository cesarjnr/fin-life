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
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { AssetsService } from '../../../core/services/assets.service';
import { UploadInputComponent } from '../../../shared/components/upload-input/upload-input.component';
import { BuysSellsService } from '../../../core/services/buys-sells.service';
import { BuySell } from '../../../core/dtos/buy-sell.dto';

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
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly toastrService = inject(ToastrService);
  private readonly assetsService = inject(AssetsService);
  private readonly buysSellsService = inject(BuysSellsService);

  public readonly selectedAsset = input<string>();
  public cancelModal = output<void>();
  public importBuysSells = output<BuySell[]>();
  public readonly importBuysSellsModalContentTemplate = viewChild<
    TemplateRef<any>
  >('importBuysSellsModalContentTemplate');
  public readonly importBuysSellsModalActionsTemplate = viewChild<
    TemplateRef<any>
  >('importBuysSellsModalActionsTemplate');
  public uploadedFile = signal<File | undefined>(undefined);
  public asset = new FormControl<number | null>(null, Validators.required);
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
    const portfolioId = Number(
      this.activatedRoute.snapshot.paramMap.get('portfolioId') ||
        this.activatedRoute.snapshot.parent!.paramMap.get('portfolioId'),
    );

    this.buysSellsService
      .import(1, portfolioId, {
        assetId: this.asset.value!,
        file: this.uploadedFile()!,
      })
      .subscribe({
        next: (buysSells) => {
          this.importBuysSells.emit(buysSells);
          this.asset.reset();
          this.toastrService.success('Operações importadas com sucesso');
        },
      });
  }

  private getAssets(): void {
    this.assetsService.get().subscribe({
      next: (assets) => {
        this.assetInputOptions = assets.map((asset) => ({
          label: asset.ticker,
          value: asset.id,
        }));

        if (this.selectedAsset()) {
          this.asset.setValue(Number(this.selectedAsset()!));
          this.asset.disable();
        }
      },
    });
  }
}
