import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    CommonExpansionPanelModule,
    CommonInputModule
} from '@galileo/web_common-libraries';
import { LayerPanelConfigComponent } from './layer-panel-config.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { CommonlocalizationAdapterModule, TranslateModule as HxGNTranslateModule } from '@galileo/web_commonlocalization/adapter';
import { LayerOpacityModule } from '../layer-opacity/layer-opacity.module';
import { LayerZoomControlModule } from '../layer-zoom-control/layer-zoom-control.module';

@NgModule({
    imports: [CommonModule,
        CommonInputModule,
        CommonExpansionPanelModule,
        FormsModule,
        DragDropModule,
        MatRadioModule,
        MatSliderModule,
        MatSlideToggleModule,
        LayerOpacityModule,
        LayerZoomControlModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule
    ],
    exports: [LayerPanelConfigComponent],
    declarations: [LayerPanelConfigComponent],
    providers: [],
})
export class LayerPanelConfigModule { }
