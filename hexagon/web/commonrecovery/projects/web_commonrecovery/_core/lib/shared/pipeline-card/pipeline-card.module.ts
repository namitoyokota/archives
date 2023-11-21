import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { CommonPopoverModule } from '@galileo/web_common-libraries';
import {
    CommonlocalizationAdapterModule,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';

import { PipelineCardComponent } from './pipeline-card.component';

@NgModule({
  imports: [
    MatTableModule,
    CommonModule,
    OverlayModule,
    CommonPopoverModule,
    CommonlocalizationAdapterModule,
    HxGNTranslateModule,
    MatProgressSpinnerModule
  ],
  exports: [PipelineCardComponent],
  declarations: [PipelineCardComponent],
  providers: [],
})
export class PipelineCardModule { }
