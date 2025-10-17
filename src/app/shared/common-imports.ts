import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Material Components
import { MatCard, MatCardHeader, MatCardContent, MatCardFooter, MatCardActions, MatCardTitle, MatCardModule } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatLabel, MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListItem, MatNavList } from '@angular/material/list';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSpinner } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDrawer, MatDrawerContainer } from '@angular/material/sidenav';
import { MatToolbar } from '@angular/material/toolbar';

export const COMMON_IMPORTS = [
  CommonModule,
  ReactiveFormsModule,
  FormsModule,
  MatInputModule,
  MatIcon,
  MatCard,
  MatCardHeader,
  MatCardContent,
  MatFormField,
  MatLabel,
  MatError,
  MatCheckbox,
  MatSpinner,
  MatCardFooter,
  MatCardActions,
  MatCardTitle,
  MatFormFieldModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatCardModule,
  MatSelectModule,
  MatProgressBar,
  MatDrawerContainer,
  MatDrawer,
  MatDivider,
  MatNavList,
  MatListItem,
  MatToolbar
];
