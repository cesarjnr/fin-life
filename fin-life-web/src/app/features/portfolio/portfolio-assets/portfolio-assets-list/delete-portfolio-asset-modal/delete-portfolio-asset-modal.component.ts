import {
  Component,
  inject,
  output,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../../../../../core/services/auth.service';
import { PortfoliosAssetsService } from '../../../../../core/services/portfolios-assets.service';

@Component({
  selector: 'app-delete-portfolio-asset-modal',
  imports: [MatButtonModule],
  templateUrl: './delete-portfolio-asset-modal.component.html',
})
export class DeletePortfolioAssetModalComponent {
  private readonly authService = inject(AuthService);
  private readonly toastrService = inject(ToastrService);
  private readonly portfoliosAssetsService = inject(PortfoliosAssetsService);

  public readonly cancelModal = output<void>();
  public readonly deletePortfolioAsset = output<void>();
  public readonly deletePortfolioAssetModalContentTemplate = viewChild<
    TemplateRef<any>
  >('deletePortfolioAssetModalContentTemplate');
  public readonly deletePortfolioAssetModalActionsTemplate = viewChild<
    TemplateRef<any>
  >('deletePortfolioAssetModalActionsTemplate');

  public handleCancelButtonClick(): void {
    this.cancelModal.emit();
  }

  public handleConfirmButtonClick(portfolioAssetId: number): void {
    const loggedUser = this.authService.getLoggedUser()!;
    const defaultPortfolio = loggedUser.portfolios.find(
      (portfolio) => portfolio.default,
    )!;

    this.portfoliosAssetsService
      .delete(defaultPortfolio.id, portfolioAssetId)
      .subscribe({
        next: () => {
          this.deletePortfolioAsset.emit();
          this.toastrService.success('Ativo excluído com sucesso');
        },
        error: () => {
          this.cancelModal.emit();
        },
      });
  }
}
