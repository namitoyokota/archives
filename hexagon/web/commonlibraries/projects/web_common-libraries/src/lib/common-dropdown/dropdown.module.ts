import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule} from '@angular/forms';

import {
    CommonDropdownComponent,
    CommonDropdownItemComponent,
    CommonDropdownToggleButtonComponent,
    CommonDropdownTriggerComponent
} from './dropdown.component';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
    imports: [
        CommonModule,
        MatCheckboxModule,
        ReactiveFormsModule,
        MatSelectModule
    ],
    declarations: [
        CommonDropdownComponent,
        CommonDropdownItemComponent,
        CommonDropdownToggleButtonComponent,
        CommonDropdownTriggerComponent
    ],
    exports: [CommonDropdownComponent, CommonDropdownItemComponent, CommonDropdownToggleButtonComponent, CommonDropdownTriggerComponent],
    providers: []
})
export class CommonDropdownModule {
    constructor() { }
}
