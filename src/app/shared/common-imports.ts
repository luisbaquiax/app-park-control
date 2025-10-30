// common-imports.ts
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Material Components
import { MatCard, MatCardHeader, MatCardContent, MatCardFooter, MatCardActions, MatCardTitle, MatCardSubtitle, MatCardModule } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatChip } from '@angular/material/chips';
import { MatNativeDateModule, MatOptionModule, MatOption } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatLabel, MatError, MatFormFieldModule, MatHint, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListItem, MatNavList } from '@angular/material/list';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSpinner } from '@angular/material/progress-spinner';
import { MatSelectModule, MatSelect } from '@angular/material/select';
import { MatDrawer, MatDrawerContainer } from '@angular/material/sidenav';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

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
  MatCardSubtitle,
  MatFormFieldModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatCardModule,
  MatSelectModule,
  MatSelect,
  MatProgressBar,
  MatDrawerContainer,
  MatDrawer,
  MatDivider,
  MatNavList,
  MatListItem,
  MatToolbar,
  MatTab,
  MatChip,
  MatTabGroup,
  MatOptionModule,
  MatOption,
  MatButtonModule,
  MatHint,
  MatPrefix,
  MatSuffix,
  MatMenuModule
];
