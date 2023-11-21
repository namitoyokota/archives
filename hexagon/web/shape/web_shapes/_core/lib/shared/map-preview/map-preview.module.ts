import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  CommonlocalizationAdapterModule,
  TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';
import { MapModule } from '@galileo/web_commonmap/adapter';

import { MapPreviewComponent } from './map-preview.component';

@NgModule({
  imports: [
    CommonModule,
    MapModule,
    CommonlocalizationAdapterModule,
    HxGNTranslateModule,
  ],
  exports: [MapPreviewComponent],
  declarations: [MapPreviewComponent],
  providers: [],
})
export class MapPreviewModule { }
