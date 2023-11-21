import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
    CommonlocalizationAdapterModule,
    CommonlocalizationAdapterService$v1,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';

import { TranslationGroup } from '../translation-groups';
import { CommonMenuItemComponent, CommonPopoverComponent } from './common-popover.component';

@NgModule({
    declarations: [
        CommonMenuItemComponent,
        CommonPopoverComponent
    ],
    imports: [
        CommonlocalizationAdapterModule,
        CommonModule,
        FormsModule,
        HxGNTranslateModule,
        MatCheckboxModule,
        OverlayModule
    ],
    exports: [
        CommonMenuItemComponent,
        CommonPopoverComponent
    ]
})
export class CommonPopoverModule {

    constructor(
        private localizationAdapter: CommonlocalizationAdapterService$v1
    ) {
        this.localizationAdapter.localizeGroup([
            TranslationGroup.main
        ]);
    }
}
