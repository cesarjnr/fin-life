import {
  Component,
  effect,
  inject,
  input,
  output,
  TemplateRef,
  viewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';
import { defer, iif } from 'rxjs';

import { CommentsService } from '../../../../../../core/services/comments.service';
import { Comment } from '../../../../../../core/dtos/comments.dto';
import { AuthService } from '../../../../../../core/services/auth.service';
import { CommonService } from '../../../../../../core/services/common.service';

interface CommentForm {
  text: FormControl<string | null>;
}

@Component({
  selector: 'app-portfolio-asset-comment-modal',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
  ],
  templateUrl: './portfolio-asset-comment-modal.component.html',
  styleUrl: './portfolio-asset-comment-modal.component.scss',
  standalone: true,
})
export class PortfolioAssetCommentModalComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly toastrService = inject(ToastrService);
  private readonly commentsService = inject(CommentsService);
  private readonly authService = inject(AuthService);
  private readonly commonService = inject(CommonService);

  public readonly assetId = input<number>();
  public readonly comment = input<Comment>();
  public readonly cancelModal = output<void>();
  public readonly saveComment = output<void>();
  public readonly commentModalContentTemplate = viewChild<TemplateRef<any>>(
    'commentModalContentTemplate',
  );
  public readonly commentModalActionsTemplate = viewChild<TemplateRef<any>>(
    'commentModalActionsTemplate',
  );
  public readonly commentForm = this.formBuilder.group<CommentForm>({
    text: new FormControl<string | null>(null, Validators.required),
  });

  constructor() {
    effect(() => {
      const comment = this.comment();

      if (comment) {
        this.commentForm.setValue({
          text: comment.text,
        });
      }
    });
  }

  public handleCancelButtonClick(): void {
    this.commentForm.reset();
    this.cancelModal.emit();
  }

  public handleConfirmButtonClick(): void {
    const loggedUser = this.authService.getLoggedUser()!;
    const defaultPortfolio = loggedUser.portfolios.find(
      (portfolio) => portfolio.default,
    )!;
    const formValues = this.commentForm.value;
    const commentFormDto = {
      text: formValues.text!,
    };

    this.commonService.setLoading(true);
    iif(
      () => !!this.comment(),
      defer(() =>
        this.commentsService.update(
          defaultPortfolio.id,
          this.assetId()!,
          this.comment()!.id,
          commentFormDto,
        ),
      ),
      defer(() =>
        this.commentsService.create(
          defaultPortfolio.id,
          this.assetId()!,
          commentFormDto,
        ),
      ),
    ).subscribe({
      next: () => {
        this.saveComment.emit();
        this.commentForm.reset();
        this.toastrService.success('Comentário salvo com sucesso');
        this.commonService.setLoading(false);
      },
    });
  }
}
