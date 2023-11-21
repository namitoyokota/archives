import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayerZoomControlComponent } from './layer-zoom-control.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonlocalizationAdapterModule, TranslateModule as HxGNTranslateModule } from '@galileo/web_commonlocalization/adapter';

@NgModule({
    imports: [
        CommonModule,
        MatCheckboxModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule
    ],
    exports: [LayerZoomControlComponent],
    declarations: [LayerZoomControlComponent],
    providers: [],
})
export class LayerZoomControlModule { }
