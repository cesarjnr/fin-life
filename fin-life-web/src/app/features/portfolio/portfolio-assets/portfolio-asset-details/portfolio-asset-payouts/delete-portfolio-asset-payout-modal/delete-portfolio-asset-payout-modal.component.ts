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

import { PayoutsService } from '../../../../../../core/services/payouts.service';
import { AuthService } from '../../../../../../core/services/auth.service';
import { PortfolioAsset } from '../../../../../../core/dtos/portfolio-asset.dto';
import { CommonService } from '../../../../../../core/services/common.service';

@Component({
  selector: 'app-delete-portfolio-asset-payout-modal',
  imports: [MatButtonModule],
  templateUrl: './delete-portfolio-asset-payout-modal.component.html',
  styleUrl: './delete-portfolio-asset-payout-modal.component.scss',
})
export class DeletePortfolioAssetPayoutModalComponent {
  private readonly authService = inject(AuthService);
  private readonly toastrService = inject(ToastrService);
  private readonly payoutsService = inject(PayoutsService);
  private readonly commonService = inject(CommonService);

  public portfolioAsset = input<PortfolioAsset>();
  public readonly cancelModal = output<void>();
  public readonly deletePayout = output<void>();
  public readonly deletePayoutModalContentTemplate = viewChild<
    TemplateRef<any>
  >('deletePayoutModalContentTemplate');
  public readonly deletePayoutModalActionsTemplate = viewChild<
    TemplateRef<any>
  >('deletePayoutModalActionsTemplate');

  public handleCancelButtonClick(): void {
    this.cancelModal.emit();
  }

  public handleConfirmButtonClick(id: number): void {
    const loggedUser = this.authService.getLoggedUser()!;
    const defaultPortfolio = loggedUser.portfolios.find(
      (portfolio) => portfolio.default,
    )!;

    this.commonService.setLoading(true);
    this.payoutsService
      .delete(defaultPortfolio.id, this.portfolioAsset()!.id, id)
      .subscribe({
        next: () => {
          this.deletePayout.emit();
          this.toastrService.success('Provento excluído com sucesso');
          this.commonService.setLoading(false);
        },
      });
  }
}
