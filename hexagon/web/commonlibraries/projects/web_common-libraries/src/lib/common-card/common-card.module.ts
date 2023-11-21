import { NgModule } from '@angular/core';

import {
    CommonCardComponent,
    CommonCardIconPaneComponent,
    CommonCardInfoContentPaneComponent,
    CommonCardTitlePaneComponent,
    CommonCardActionPaneComponent,
    CommonCardStatusContentPaneComponent
} from './common-card.component';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [CommonModule],
    exports: [
        CommonCardComponent,
        CommonCardIconPaneComponent,
        CommonCardInfoContentPaneComponent,
        CommonCardTitlePaneComponent,
        CommonCardActionPaneComponent,
        CommonCardStatusContentPaneComponent
    ],
    declarations: [
        CommonCardComponent,
        CommonCardIconPaneComponent,
        CommonCardInfoContentPaneComponent,
        CommonCardTitlePaneComponent,
        CommonCardActionPaneComponent,
        CommonCardStatusContentPaneComponent
    ],
    providers: [],
})
export class CommonCardModule { }
