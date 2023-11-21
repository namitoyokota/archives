import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonInitialsModule } from '@galileo/web_common-libraries';
import { UserIconModule$v2 } from '@galileo/web_commonidentity/adapter';
import {
    CommonlocalizationAdapterModule,
    CommonlocalizationAdapterService$v1,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';

import { TranslationGroup } from '../translation-groups';
import { CommonMainMenuItemComponent } from './main-menu-item/main-menu-item.component';
import {
    CommonMainMenuComponent,
    CommonMainMenuSectionComponent,
    CommonMainMenuSectionContentComponent,
} from './main-menu.component';

@NgModule({
    imports: [
        CommonInitialsModule,
        CommonModule,
        FormsModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        UserIconModule$v2
    ],
    declarations: [
        CommonMainMenuComponent,
        CommonMainMenuItemComponent,
        CommonMainMenuSectionComponent,
        CommonMainMenuSectionContentComponent
    ],
    exports: [
        CommonMainMenuComponent,
        CommonMainMenuItemComponent,
        CommonMainMenuSectionComponent,
        CommonMainMenuSectionContentComponent
    ],
    providers: []
})
export class MainMenuModule {
    constructor(private localizationAdapter: CommonlocalizationAdapterService$v1) {
        this.localizationAdapter.localizeGroup([
            TranslationGroup.main
        ]);
    }
}
