import {
  Component,
  inject,
  output,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';

import { BuysSellsService } from '../../../core/services/buys-sells.service';

@Component({
  selector: 'app-delete-buy-sell-modal',
  imports: [MatButtonModule],
  templateUrl: './delete-buy-sell-modal.component.html',
})
export class DeleteBuySellModalComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly toastrService = inject(ToastrService);
  private readonly buysSellsService = inject(BuysSellsService);

  public readonly deleteBuySellModalContentTemplate = viewChild<
    TemplateRef<any>
  >('deleteBuySellModalContentTemplate');
  public readonly deleteBuySellModalActionsTemplate = viewChild<
    TemplateRef<any>
  >('deleteBuySellModalActionsTemplate');
  public readonly cancelModal = output<void>();
  public readonly deleteBuySell = output<void>();

  public handleCancelButtonClick(): void {
    this.cancelModal.emit();
  }

  public handleConfirmButtonClick(id: number): void {
    const portfolioId = Number(
      this.activatedRoute.snapshot.paramMap.get('portfolioId') ||
        this.activatedRoute.snapshot.parent!.paramMap.get('portfolioId'),
    );

    this.buysSellsService.delete(1, portfolioId, id).subscribe({
      next: () => {
        this.deleteBuySell.emit();
        this.toastrService.success('Operação excluída com sucesso');
      },
    });
  }
}
