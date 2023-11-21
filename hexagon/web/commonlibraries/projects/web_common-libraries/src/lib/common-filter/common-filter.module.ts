import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    CommonlocalizationAdapterModule,
    CommonlocalizationAdapterService$v1,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';

import { CommonDropdownModule$v2 } from '../common-dropdown-v2/common-dropdown.module.v2';
import { CommonInputModule$v2 } from '../common-input-v2/common-input.module.v2';
import { TranslationGroup } from '../translation-groups';
import { FilterOperationComponent } from './filter-operation/filter-operation.component';
import { FilterPaneComponent } from './filter-pane/filter-pane.component';

/** @deprecated Should use CommonFilterModule$v2 now */
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        CommonDropdownModule$v2,
        CommonlocalizationAdapterModule,
        CommonInputModule$v2,
        HxGNTranslateModule
    ],
    exports: [
        FilterOperationComponent,
        FilterPaneComponent
    ],
    declarations: [
        FilterOperationComponent,
        FilterPaneComponent
    ],
})
export class CommonFilterModule {
    constructor(private localizationAdapter: CommonlocalizationAdapterService$v1) {
        this.localizationAdapter.localizeGroup([
            TranslationGroup.main
        ]);
    }
}
