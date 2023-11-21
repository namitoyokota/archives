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
import { CommonDatepickerModule } from '../common-datepicker/common-datepicker.module';
import { TranslationGroup } from '../translation-groups';
import { FilterOperationComponent$v2 } from './filter-operation-v2/filter-operation.component.v2';
import { FilterPaneComponent$v2 } from './filter-pane-v2/filter-pane.component.v2';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        CommonDropdownModule$v2,
        CommonlocalizationAdapterModule,
        CommonInputModule$v2,
        HxGNTranslateModule,
        CommonDatepickerModule
    ],
    exports: [
        FilterOperationComponent$v2,
        FilterPaneComponent$v2
    ],
    declarations: [
        FilterOperationComponent$v2,
        FilterPaneComponent$v2
    ],
})
export class CommonFilterModule$v2 {
    constructor(private localizationAdapter: CommonlocalizationAdapterService$v1) {
        this.localizationAdapter.localizeGroup([
            TranslationGroup.main
        ]);
    }
}
