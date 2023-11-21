import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
    ActiveDataFilterItemComponent,
    ActiveDataFilterItemSectionComponent,
    ActiveDataFilterItemTitleSectionComponent,
    ActiveDataFilterItemTextSectionComponent
 } from './active-data-filter-item.component';

@NgModule({
    imports: [CommonModule],
    exports: [
        ActiveDataFilterItemComponent,
        ActiveDataFilterItemSectionComponent,
        ActiveDataFilterItemTitleSectionComponent,
        ActiveDataFilterItemTextSectionComponent
    ],
    declarations: [
        ActiveDataFilterItemComponent,
        ActiveDataFilterItemSectionComponent,
        ActiveDataFilterItemTitleSectionComponent,
        ActiveDataFilterItemTextSectionComponent
    ],
    providers: [],
})
export class ActiveDataFilterItemModule { }
