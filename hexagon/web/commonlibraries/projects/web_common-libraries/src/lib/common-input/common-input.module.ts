import { NgModule } from '@angular/core';

import { CommonInputComponent } from './common-input.component';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [CommonModule],
    exports: [CommonInputComponent],
    declarations: [CommonInputComponent],
    providers: [],
})
export class CommonInputModule { }
