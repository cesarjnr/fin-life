import { CommonModule } from '@angular/common';
import { Component, inject, TemplateRef } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';

export interface ModalData {
  title?: string;
  contentTemplate?: TemplateRef<any>;
  actionsTemplate?: TemplateRef<any>;
  context?: Record<string, any>;
}

@Component({
  selector: 'app-modal',
  imports: [CommonModule, MatDialogTitle, MatDialogContent, MatDialogActions],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  public modalData = inject<ModalData>(MAT_DIALOG_DATA);
}
