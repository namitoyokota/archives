import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayerPanelLayersModule } from '../layer-panel-layers/layer-panel-layers.module';
import { LayerPanelComponent } from './layer-panel.component';
import { MatSliderModule } from '@angular/material/slider';
import { CommonInputModule$v2 } from '@galileo/web_common-libraries';
import { CommonlocalizationAdapterModule, TranslateModule as HxGNTranslateModule } from '@galileo/web_commonlocalization/adapter';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatSliderModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        CommonInputModule$v2,
        LayerPanelLayersModule
    ],
    exports: [LayerPanelComponent],
    declarations: [LayerPanelComponent],
    providers: [],
})
export class LayerPanelModule { }
