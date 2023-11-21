import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayerPanelLayersModule } from '../layer-panel-layers/layer-panel-layers.module';
import { LayerPanelDialogComponent } from './layer-panel-dialog.component';
import { MatSliderModule } from '@angular/material/slider';
import { CommonlocalizationAdapterModule, TranslateModule as HxGNTranslateModule } from '@galileo/web_commonlocalization/adapter';

@NgModule({
    imports: [
        CommonModule,
        MatSliderModule,
        LayerPanelLayersModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule
    ],
    exports: [LayerPanelDialogComponent],
    declarations: [LayerPanelDialogComponent],
    providers: [],
})
export class LayerPanelDialogModule { }
