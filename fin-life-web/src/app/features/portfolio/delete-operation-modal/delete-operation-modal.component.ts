import {
  Component,
  inject,
  output,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';

import { OperationsService } from '../../../core/services/operations.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-delete-operation-modal',
  imports: [MatButtonModule],
  templateUrl: './delete-operation-modal.component.html',
})
export class DeleteOperationModalComponent {
  private readonly authService = inject(AuthService);
  private readonly toastrService = inject(ToastrService);
  private readonly operationsService = inject(OperationsService);

  public readonly cancelModal = output<void>();
  public readonly deleteOperation = output<void>();
  public readonly deleteOperationModalContentTemplate = viewChild<
    TemplateRef<any>
  >('deleteOperationModalContentTemplate');
  public readonly deleteOperationModalActionsTemplate = viewChild<
    TemplateRef<any>
  >('deleteOperationModalActionsTemplate');

  public handleCancelButtonClick(): void {
    this.cancelModal.emit();
  }

  public handleConfirmButtonClick(id: number): void {
    const loggedUser = this.authService.getLoggedUser()!;
    const defaultPortfolio = loggedUser.portfolios.find(
      (portfolio) => portfolio.default,
    )!;

    this.operationsService.delete(defaultPortfolio.id, id).subscribe({
      next: () => {
        this.deleteOperation.emit();
        this.toastrService.success('Operação excluída com sucesso');
      },
      error: () => {
        this.cancelModal.emit();
      },
    });
  }
}
