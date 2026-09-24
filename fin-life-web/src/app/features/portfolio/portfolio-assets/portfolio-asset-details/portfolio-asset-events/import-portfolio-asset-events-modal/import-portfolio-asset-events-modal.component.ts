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

import { PortfoliosAssetsEventsService } from '../../../../../../core/services/portfolios-assets-events.service';
import { PortfolioAssetEvent } from '../../../../../../core/dtos/portfolio-asset-event.dto';
import { AuthService } from '../../../../../../core/services/auth.service';
import { PortfolioAsset } from '../../../../../../core/dtos/portfolio-asset.dto';
import { UploadInputComponent } from '../../../../../../shared/components/upload-input/upload-input.component';
import { CommonService } from '../../../../../../core/services/common.service';

@Component({
  selector: 'app-import-portfolio-asset-events-modal',
  imports: [MatButtonModule, UploadInputComponent],
  templateUrl: './import-portfolio-asset-events-modal.component.html',
  styleUrl: './import-portfolio-asset-events-modal.component.scss',
})
export class ImportPortfolioAssetEventsModalComponent {
  private readonly toastrService = inject(ToastrService);
  private readonly commonService = inject(CommonService);
  private readonly portfoliosAssetsEventsService = inject(
    PortfoliosAssetsEventsService,
  );
  private readonly authService = inject(AuthService);

  public portfolioAsset = input<PortfolioAsset>();
  public cancelModal = output<void>();
  public readonly importEvents = output<PortfolioAssetEvent[]>();
  public readonly importEventsModalContentTemplate = viewChild<
    TemplateRef<any>
  >('importEventsModalContentTemplate');
  public readonly importEventsModalActionsTemplate = viewChild<
    TemplateRef<any>
  >('importEventsModalActionsTemplate');
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
    this.portfoliosAssetsEventsService
      .import(
        defaultPortfolio.id,
        this.portfolioAsset()!.id,
        this.uploadedFile()!,
      )
      .subscribe({
        next: (events) => {
          this.importEvents.emit(events);
          this.toastrService.success('Eventos importados com sucesso');
          this.commonService.setLoading(false);
        },
      });
  }
}
