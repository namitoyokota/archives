import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';

import {
    CommonDropdownItemComponent$v2,
    CommonDropdownTriggerComponent$v2,
    CommonDropdownComponent$v2
} from './common-dropdown.component.v2';


@NgModule({
    imports: [
        CommonModule,
        MatSelectModule
    ],
    declarations: [
        CommonDropdownComponent$v2,
        CommonDropdownItemComponent$v2,
        CommonDropdownTriggerComponent$v2
    ],
    exports: [
        CommonDropdownComponent$v2,
        CommonDropdownItemComponent$v2,
        CommonDropdownTriggerComponent$v2
    ]
})
export class CommonDropdownModule$v2 { }
