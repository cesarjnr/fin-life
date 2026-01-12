import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  Signal,
  viewChild,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable, tap } from 'rxjs';
import { format } from 'date-fns';

import {
  PaginatorConfig,
  TableAction,
  TableComponent,
  TableHeader,
  TableRow,
} from '../../../../../shared/components/table/table.component';
import { Comment } from '../../../../../core/dtos/comments.dto';
import {
  GetRequestParams,
  GetRequestResponse,
} from '../../../../../core/dtos/request';
import { CommentsService } from '../../../../../core/services/comments.service';
import { PortfolioAssetCommentModalComponent } from './portfolio-asset-comment-modal/portfolio-asset-comment-modal.component';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { CommonService } from '../../../../../core/services/common.service';
import { DeletePortfolioAssetCommentModalComponent } from './delete-portfolio-asset-comment-modal/delete-portfolio-asset-comment-modal.component';
import { PortfolioAsset } from '../../../../../core/dtos/portfolio-asset.dto';

interface CommentTableRowData {
  id: number;
  text: string;
  createdAt: string;
  updatedAt: string;
  actions: {
    delete: boolean;
  };
}

@Component({
  selector: 'app-portfolio-asset-comments',
  imports: [
    MatButtonModule,
    MatIconModule,
    TableComponent,
    PortfolioAssetCommentModalComponent,
    DeletePortfolioAssetCommentModalComponent,
  ],
  templateUrl: './portfolio-asset-comments.component.html',
})
export class PortfolioAssetCommentsComponent {
  private readonly dialog = inject(MatDialog);
  private readonly commonService = inject(CommonService);
  private readonly commentsService = inject(CommentsService);
  private readonly comments = signal<Comment[]>([]);

  public readonly portfolioAsset = input<PortfolioAsset>();
  public readonly portfolioAssetCommentModalComponent = viewChild(
    PortfolioAssetCommentModalComponent,
  );
  public readonly deletePortfolioAssetCommentModalComponent = viewChild(
    DeletePortfolioAssetCommentModalComponent,
  );
  public readonly comment = signal<Comment | undefined>(undefined);
  public readonly tableData: Signal<CommentTableRowData[]> = computed(() =>
    this.comments().map((comment) => ({
      id: comment.id,
      createdAt: format(comment.createdAt, 'dd/MM/yyyy HH:mm'),
      updatedAt: format(comment.updatedAt, 'dd/MM/yyyy HH:mm'),
      text: comment.text,
      actions: {
        delete: true,
      },
    })),
  );
  public readonly paginatorConfig = signal<PaginatorConfig | undefined>(
    undefined,
  );
  public readonly tableHeaders: TableHeader[] = [
    { key: 'createdAt', value: 'Criado Em' },
    { key: 'updatedAt', value: 'Atualizado Em' },
    { key: 'text', value: 'Conteúdo' },
    { key: 'actions', value: '' },
  ];
  public assetId?: number;
  public modalRef?: MatDialogRef<ModalComponent>;

  constructor() {
    effect(() => {
      this.getComments()?.subscribe();
    });
  }

  public handleRowClick(row: TableRow): void {
    const commentTableRowData = row as CommentTableRowData;

    this.comment.set(
      this.comments().find((comment) => comment.id === commentTableRowData.id),
    );
    this.handleAddButtonClick();
  }

  public handleTableActionButtonClick(action: TableAction): void {
    const commentTableRowData = action.row as CommentTableRowData;

    if (action.name === 'delete') {
      const deletePortfolioAssetCommentModalComponent =
        this.deletePortfolioAssetCommentModalComponent();

      this.modalRef = this.dialog.open(ModalComponent, {
        autoFocus: 'dialog',
        data: {
          title: 'Excluir Comentário',
          contentTemplate:
            deletePortfolioAssetCommentModalComponent?.deletePortfolioAssetCommentModalContentTemplate(),
          actionsTemplate:
            deletePortfolioAssetCommentModalComponent?.deletePortfolioAssetCommentModalActionsTemplate(),
          context: {
            portfolioAssetId: this.portfolioAsset()?.id,
            commentId: commentTableRowData.id,
          },
        },
        restoreFocus: false,
      });
    }
  }

  public handleAddButtonClick(): void {
    const portfolioAssetCommentModalComponent =
      this.portfolioAssetCommentModalComponent();

    this.modalRef = this.dialog.open(ModalComponent, {
      autoFocus: 'dialog',
      data: {
        title: this.comment() ? 'Editar Comentário' : 'Adicionar Comentário',
        contentTemplate:
          portfolioAssetCommentModalComponent?.commentModalContentTemplate(),
        actionsTemplate:
          portfolioAssetCommentModalComponent?.commentModalActionsTemplate(),
        context: {
          portfolioAssetId: this.portfolioAsset()?.id,
        },
        restoreFocus: false,
      },
    });
  }

  public updateCommentsList(): void {
    this.getComments()?.subscribe({
      next: () => {
        this.closeModal();
      },
    });
  }

  public closeModal(): void {
    this.modalRef!.close();
    this.comment.set(undefined);

    this.modalRef = undefined;
  }

  private getComments(
    paginationParams?: GetRequestParams,
  ): Observable<GetRequestResponse<Comment>> | void {
    if (this.portfolioAsset()) {
      this.commonService.setLoading(true);

      const params = paginationParams ?? { limit: 10, page: 0 };

      return this.commentsService.get(this.portfolioAsset()!.id, params).pipe(
        tap((getCommentsResponse) => {
          const { data, total, page, itemsPerPage } = getCommentsResponse;

          this.comments.set(data);
          this.paginatorConfig.set({
            length: total,
            pageIndex: page!,
            pageSize: itemsPerPage!,
          });
          this.commonService.setLoading(false);
        }),
      );
    }
  }
}
