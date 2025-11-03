import { ChangeDetectionStrategy, Component, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { COMMON_IMPORTS } from '../../../../shared/common-imports';

@Component({
  selector: 'app-dialog-status',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    ...COMMON_IMPORTS
  ],
  templateUrl: './dialog-status.html',
  styleUrl: './dialog-status.scss',
})
export class DialogStatus {
  readonly dialogRef = inject(MatDialogRef<DialogStatus>);
  readonly estados = inject<string[]>(MAT_DIALOG_DATA);
  estadoSelecionado: string | undefined;

  closeDialog() {
    this.dialogRef.close();
  }
}
