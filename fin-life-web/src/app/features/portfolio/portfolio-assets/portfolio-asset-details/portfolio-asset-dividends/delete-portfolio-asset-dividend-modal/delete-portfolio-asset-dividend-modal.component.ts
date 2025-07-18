import {
  Component,
  inject,
  input,
  output,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';

import { PortfoliosAssetsDividendsService } from '../../../../../../core/services/portfolios-assets-dividends.service';
import { AuthService } from '../../../../../../core/services/auth.service';
import { PortfolioAsset } from '../../../../../../core/dtos/portfolio-asset.dto';
import { CommonService } from '../../../../../../core/services/common.service';

@Component({
  selector: 'app-delete-portfolio-asset-dividend-modal',
  imports: [MatButtonModule],
  templateUrl: './delete-portfolio-asset-dividend-modal.component.html',
  styleUrl: './delete-portfolio-asset-dividend-modal.component.scss',
})
export class DeletePortfolioAssetDividendModalComponent {
  private readonly authService = inject(AuthService);
  private readonly toastrService = inject(ToastrService);
  private readonly portfoliosAssetsDividendsService = inject(
    PortfoliosAssetsDividendsService,
  );
  private readonly commonService = inject(CommonService);

  public portfolioAsset = input<PortfolioAsset>();
  public readonly cancelModal = output<void>();
  public readonly deletePortfolioAssetDividend = output<void>();
  public readonly deletePortfolioAssetDividendModalContentTemplate = viewChild<
    TemplateRef<any>
  >('deletePortfolioAssetDividendModalContentTemplate');
  public readonly deletePortfolioAssetDividendModalActionsTemplate = viewChild<
    TemplateRef<any>
  >('deletePortfolioAssetDividendModalActionsTemplate');

  public handleCancelButtonClick(): void {
    this.cancelModal.emit();
  }

  public handleConfirmButtonClick(id: number): void {
    const loggedUser = this.authService.getLoggedUser()!;
    const defaultPortfolio = loggedUser.portfolios.find(
      (portfolio) => portfolio.default,
    )!;

    this.commonService.setLoading(true);
    this.portfoliosAssetsDividendsService
      .delete(defaultPortfolio.id, this.portfolioAsset()!.id, id)
      .subscribe({
        next: () => {
          this.deletePortfolioAssetDividend.emit();
          this.toastrService.success('Provento excluído com sucesso');
          this.commonService.setLoading(false);
        },
      });
  }
}
