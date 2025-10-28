import { Component, output, TemplateRef, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

export interface ToggleStateChange {
  id: number;
  state: boolean;
}

@Component({
  selector: 'app-toggle-state-modal',
  imports: [MatButtonModule],
  templateUrl: './toggle-state-modal.component.html',
})
export class ToggleStateModalComponent {
  public readonly cancel = output<ToggleStateChange>();
  public readonly confirm = output<ToggleStateChange>();
  public readonly toggleStateModalContentTemplate = viewChild<TemplateRef<any>>(
    'toggleStateModalContentTemplate',
  );
  public readonly toggleStateModalActionsTemplate = viewChild<TemplateRef<any>>(
    'toggleStateModalActionsTemplate',
  );

  public handleCancelButtonClick(id: number, state: boolean): void {
    this.cancel.emit({ id, state });
  }

  public handleConfirmButtonClick(id: number, state: boolean): void {
    this.confirm.emit({ id, state });
  }
}
