import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import {
    CommonlocalizationAdapterModule,
    CommonlocalizationAdapterService$v1,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';

import { CommonPopoverModule } from '../common-popover/common-popover.module';
import { TranslationGroup } from '../translation-groups';
import { CommonPropertiesComponent } from './common-properties.component';

@NgModule({
    declarations: [
        CommonPropertiesComponent
    ],
    imports: [
        CommonlocalizationAdapterModule,
        CommonModule,
        CommonPopoverModule,
        HxGNTranslateModule,
        MatSortModule,
        MatTableModule,
        OverlayModule
    ],
    exports: [
        CommonPropertiesComponent
    ]
})
export class CommonPropertiesModule {
    constructor(private localizationAdapter: CommonlocalizationAdapterService$v1) {
        this.localizationAdapter.localizeGroup([
            TranslationGroup.main
        ]);
    }
}
