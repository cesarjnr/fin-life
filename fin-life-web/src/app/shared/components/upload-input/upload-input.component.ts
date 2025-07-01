import { Component, inject, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-upload-input',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './upload-input.component.html',
  styleUrl: './upload-input.component.scss',
})
export class UploadInputComponent {
  private readonly toastrService = inject(ToastrService);

  public readonly allowedExtensions = input<string[]>();
  public readonly maxFiles = input<number>();
  public readonly uploadFile = output<File[]>();
  public readonly files = signal<File[]>([]);
  public readonly isDragging = signal<boolean>(false);

  public handleDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  public handleDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  public handleDrop(event: DragEvent): void {
    event.preventDefault();

    const files = [
      ...this.files(),
      ...Array.from(event.dataTransfer?.files || []),
    ];

    if (!this.isNumberOfFilesAllowed(files)) {
      this.toastrService.error(
        `Número máximo de arquivos permitidos: ${this.maxFiles()}`,
        undefined,
        { progressBar: true },
      );
    } else if (!this.areFileExtensionsAllowed(files)) {
      this.toastrService.error(
        `Extensões permitidas: ${this.allowedExtensions()!.join(', ')}`,
        undefined,
        { progressBar: true },
      );
    } else {
      this.files.set(files);
      this.uploadFile.emit(this.files());
    }

    this.isDragging.set(false);
  }

  public handleFileInputChange(event: Event): void {
    this.files.update((existingFiles) => [
      ...existingFiles,
      ...Array.from((event.target as HTMLInputElement).files || []),
    ]);
    this.uploadFile.emit(this.files());
  }

  public handleDeleteButtonClick(file: File): void {
    this.files.update((existingFiles) =>
      existingFiles.filter((existingFile) => existingFile.name !== file.name),
    );
    this.uploadFile.emit(this.files());
  }

  private isNumberOfFilesAllowed(files: File[]): boolean {
    return Boolean(this.maxFiles() && files.length <= this.maxFiles()!);
  }

  private areFileExtensionsAllowed(files: File[]): boolean {
    if (!this.allowedExtensions()?.length) {
      return true;
    }

    let allExtensionsValid = true;

    const fileExtensions = files.map(
      (file) => `.${file.type.split('/').pop()}`,
    );

    for (const extension of fileExtensions) {
      if (!this.allowedExtensions()?.includes(extension)) {
        allExtensionsValid = false;

        break;
      }
    }

    return allExtensionsValid;
  }
}
