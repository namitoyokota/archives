import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { LayerPropsCmdComponent } from './layer-props-cmd.component';
import { MatTabsModule } from '@angular/material/tabs';
import { GetFeatureInfoModule } from '../get-feature-info/get-feature-info.module';
import { CommonTabsModule, CommonExpansionPanelModule, CommonInputModule$v2 } from '@galileo/web_common-libraries';
import { CommonlocalizationAdapterModule, TranslateModule as HxGNTranslateModule } from '@galileo/web_commonlocalization/adapter';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
    imports: [
        CommonModule,
        DragDropModule,
        FormsModule,
        HxGNTranslateModule,
        MatTabsModule,
        MatProgressSpinnerModule,
        CommonTabsModule,
        CommonExpansionPanelModule,
        CommonlocalizationAdapterModule,
        CommonInputModule$v2,
        GetFeatureInfoModule
    ],
    exports: [LayerPropsCmdComponent],
    declarations: [LayerPropsCmdComponent],
    providers: [],
})
export class LayerPropsCmdModule { }
