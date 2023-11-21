import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonInputModule$v2 } from '@galileo/web_common-libraries';
import {
    CommonlocalizationAdapterModule,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';

import { SettingsDialogComponent } from './settings-dialog.component';

@NgModule({
  imports: [
    MatDialogModule,
    CommonModule,
    CommonInputModule$v2,
    CommonlocalizationAdapterModule,
    HxGNTranslateModule,
    MatProgressSpinnerModule
  ],
  exports: [SettingsDialogComponent],
  declarations: [SettingsDialogComponent],
  providers: [],
})
export class SettingsDialogModule { }
