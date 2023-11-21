import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CommonDescriptionComponent } from './common-description.component';

@NgModule({
    declarations: [
        CommonDescriptionComponent
    ],
    exports: [
        CommonDescriptionComponent
    ],
    imports: [
        CommonModule
    ]
})
export class CommonDescriptionModule { }
