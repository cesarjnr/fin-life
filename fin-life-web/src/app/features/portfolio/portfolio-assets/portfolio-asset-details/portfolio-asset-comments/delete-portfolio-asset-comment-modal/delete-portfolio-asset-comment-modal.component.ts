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

import { AuthService } from '../../../../../../core/services/auth.service';
import { CommentsService } from '../../../../../../core/services/comments.service';

@Component({
  selector: 'app-delete-portfolio-asset-comment-modal',
  imports: [MatButtonModule],
  templateUrl: './delete-portfolio-asset-comment-modal.component.html',
})
export class DeletePortfolioAssetCommentModalComponent {
  private readonly authService = inject(AuthService);
  private readonly toastrService = inject(ToastrService);
  private readonly commentsService = inject(CommentsService);

  public readonly assetId = input<number>();
  public readonly cancelModal = output<void>();
  public readonly deleteComment = output<void>();
  public readonly deletePortfolioAssetCommentModalContentTemplate = viewChild<
    TemplateRef<any>
  >('deletePortfolioAssetCommentModalContentTemplate');
  public readonly deletePortfolioAssetCommentModalActionsTemplate = viewChild<
    TemplateRef<any>
  >('deletePortfolioAssetCommentModalActionsTemplate');

  public handleCancelButtonClick(): void {
    this.cancelModal.emit();
  }

  public handleConfirmButtonClick(id: number): void {
    const loggedUser = this.authService.getLoggedUser()!;
    const defaultPortfolio = loggedUser.portfolios.find(
      (portfolio) => portfolio.default,
    )!;

    this.commentsService
      .delete(defaultPortfolio.id, this.assetId()!, id)
      .subscribe({
        next: () => {
          this.deleteComment.emit();
          this.toastrService.success('Comentário excluído com sucesso');
        },
        error: () => {
          this.cancelModal.emit();
        },
      });
  }
}
