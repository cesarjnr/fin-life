import {
  Component,
  inject,
  output,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';

import { BuysSellsService } from '../../../core/services/buys-sells.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-delete-buy-sell-modal',
  imports: [MatButtonModule],
  templateUrl: './delete-buy-sell-modal.component.html',
})
export class DeleteBuySellModalComponent {
  private readonly authService = inject(AuthService);
  private readonly toastrService = inject(ToastrService);
  private readonly buysSellsService = inject(BuysSellsService);

  public readonly cancelModal = output<void>();
  public readonly deleteBuySell = output<void>();
  public readonly deleteBuySellModalContentTemplate = viewChild<
    TemplateRef<any>
  >('deleteBuySellModalContentTemplate');
  public readonly deleteBuySellModalActionsTemplate = viewChild<
    TemplateRef<any>
  >('deleteBuySellModalActionsTemplate');

  public handleCancelButtonClick(): void {
    this.cancelModal.emit();
  }

  public handleConfirmButtonClick(id: number): void {
    const loggedUser = this.authService.getLoggedUser()!;
    const defaultPortfolio = loggedUser.portfolios.find(
      (portfolio) => portfolio.default,
    )!;

    this.buysSellsService.delete(defaultPortfolio.id, id).subscribe({
      next: () => {
        this.deleteBuySell.emit();
        this.toastrService.success('Operação excluída com sucesso');
      },
      error: () => {
        this.cancelModal.emit();
      },
    });
  }
}
