import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayerOpacityComponent } from './layer-opacity.component';
import { MatSliderModule } from '@angular/material/slider';
import { CommonlocalizationAdapterModule, TranslateModule as HxGNTranslateModule } from '@galileo/web_commonlocalization/adapter';

@NgModule({
    imports: [
        CommonModule,
        MatSliderModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule
    ],
    exports: [LayerOpacityComponent],
    declarations: [LayerOpacityComponent],
    providers: [],
})
export class LayerOpacityModule { }
