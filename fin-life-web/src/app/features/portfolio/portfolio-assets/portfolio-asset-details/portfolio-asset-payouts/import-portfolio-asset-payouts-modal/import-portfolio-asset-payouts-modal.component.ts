import {
  Component,
  inject,
  input,
  output,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';

import { PortfoliosAssetsPayoutsService } from '../../../../../../core/services/portfolios-assets-payouts.service';
import { PortfolioAssetPayout } from '../../../../../../core/dtos/portfolio-asset-payout.dto';
import { AuthService } from '../../../../../../core/services/auth.service';
import { PortfolioAsset } from '../../../../../../core/dtos/portfolio-asset.dto';
import { UploadInputComponent } from '../../../../../../shared/components/upload-input/upload-input.component';
import { CommonService } from '../../../../../../core/services/common.service';

@Component({
  selector: 'app-import-portfolio-asset-payouts-modal',
  imports: [MatButtonModule, UploadInputComponent],
  templateUrl: './import-portfolio-asset-payouts-modal.component.html',
  styleUrl: './import-portfolio-asset-payouts-modal.component.scss',
})
export class ImportPortfolioAssetPayoutsModalComponent {
  private readonly toastrService = inject(ToastrService);
  private readonly commonService = inject(CommonService);
  private readonly payoutsService = inject(PortfoliosAssetsPayoutsService);
  private readonly authService = inject(AuthService);

  public portfolioAsset = input<PortfolioAsset>();
  public cancelModal = output<void>();
  public readonly importPayouts = output<PortfolioAssetPayout[]>();
  public readonly importPayoutsModalContentTemplate = viewChild<
    TemplateRef<any>
  >('importPayoutsModalContentTemplate');
  public readonly importPayoutsModalActionsTemplate = viewChild<
    TemplateRef<any>
  >('importPayoutsModalActionsTemplate');
  public uploadedFile = signal<File | undefined>(undefined);

  public handleUploadFile(files: File[]): void {
    this.uploadedFile.set(files[0]);
  }

  public handleCancelButtonClick(): void {
    this.cancelModal.emit();
  }

  public handleConfirmButtonClick(): void {
    const loggedUser = this.authService.getLoggedUser()!;
    const defaultPortfolio = loggedUser.portfolios.find(
      (portfolio) => portfolio.default,
    )!;

    this.commonService.setLoading(true);
    this.payoutsService
      .import(
        defaultPortfolio.id,
        this.portfolioAsset()!.id,
        this.uploadedFile()!,
      )
      .subscribe({
        next: (payouts) => {
          this.importPayouts.emit(payouts);
          this.toastrService.success('Proventos importados com sucesso');
          this.commonService.setLoading(false);
        },
      });
  }
}
