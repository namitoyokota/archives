import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonInputModule$v2 } from '@galileo/web_common-libraries';
import {
    CommonlocalizationAdapterModule,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';

import { RestoreDialogComponent } from './restore-dialog.component';

@NgModule({
  imports: [
    FormsModule,
    MatCheckboxModule,
    MatDialogModule,
    CommonModule,
    CommonInputModule$v2,
    CommonlocalizationAdapterModule,
    HxGNTranslateModule,
    MatProgressSpinnerModule
  ],
  exports: [RestoreDialogComponent],
  declarations: [RestoreDialogComponent],
  providers: [],
})
export class RestoreDialogModule { }
