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

import { PortfoliosAssetsDividendsService } from '../../../../../../core/services/portfolios-assets-dividends.service';
import { PortfolioAssetDividend } from '../../../../../../core/dtos/portfolio-asset-dividend.dto';
import { AuthService } from '../../../../../../core/services/auth.service';
import { PortfolioAsset } from '../../../../../../core/dtos/portfolio-asset.dto';
import { UploadInputComponent } from '../../../../../../shared/components/upload-input/upload-input.component';
import { CommonService } from '../../../../../../core/services/common.service';

@Component({
  selector: 'app-import-portfolio-asset-dividends-modal',
  imports: [MatButtonModule, UploadInputComponent],
  templateUrl: './import-portfolio-asset-dividends-modal.component.html',
  styleUrl: './import-portfolio-asset-dividends-modal.component.scss',
})
export class ImportPortfolioAssetDividendsModalComponent {
  private readonly toastrService = inject(ToastrService);
  private readonly commonService = inject(CommonService);
  private readonly portfoliosAssetsDividendsService = inject(
    PortfoliosAssetsDividendsService,
  );
  private readonly authService = inject(AuthService);

  public portfolioAsset = input<PortfolioAsset>();
  public cancelModal = output<void>();
  public readonly importPortfolioAssetDividends =
    output<PortfolioAssetDividend[]>();
  public readonly importPortfolioAssetDividendsModalContentTemplate = viewChild<
    TemplateRef<any>
  >('importPortfolioAssetDividendsModalContentTemplate');
  public readonly importPortfolioAssetDividendsModalActionsTemplate = viewChild<
    TemplateRef<any>
  >('importPortfolioAssetDividendsModalActionsTemplate');
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
    this.portfoliosAssetsDividendsService
      .import(
        defaultPortfolio.id,
        this.portfolioAsset()!.id,
        this.uploadedFile()!,
      )
      .subscribe({
        next: (portfolioAssetDividends) => {
          this.importPortfolioAssetDividends.emit(portfolioAssetDividends);
          this.toastrService.success('Dividendos importados com sucesso');
          this.commonService.setLoading(false);
        },
      });
  }
}
