import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { CommonExpansionPanelModule, CommonInputModule$v2 } from '@galileo/web_common-libraries';
import {
    CommonlocalizationAdapterModule,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';

import { CommonCreateHyperlinksComponent } from './common-create-hyperlinks/common-create-hyperlinks.component';
import { CommonHyperlinksComponent } from './common-hyperlinks/common-hyperlinks.component';
import { CommonLinksComponent } from './common-links/common-links.component';

@NgModule({
    imports: [
        CommonExpansionPanelModule,
        CommonlocalizationAdapterModule,
        CommonModule,
        FormsModule,
        CommonInputModule$v2,
        HxGNTranslateModule,
        MatSortModule,
        MatTableModule,
        MatTableModule,
        MatSortModule
    ],
    exports: [
        CommonHyperlinksComponent,
        CommonCreateHyperlinksComponent,
        CommonLinksComponent
    ],
    declarations: [
        CommonHyperlinksComponent,
        CommonCreateHyperlinksComponent,
        CommonLinksComponent
    ],
    providers: [],
})
export class CommonHyperlinksModule { }
