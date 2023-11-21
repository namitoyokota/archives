import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayerPanelConfigModule } from '../layer-panel-config/layer-panel-config.module';
import { LayerPanelLayersComponent } from './layer-panel-layers.component';
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
        LayerPanelConfigModule
    ],
    exports: [LayerPanelLayersComponent],
    declarations: [LayerPanelLayersComponent],
    providers: [],
})
export class LayerPanelLayersModule { }
