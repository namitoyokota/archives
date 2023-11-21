import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonTooltipNameComponent } from './common-tooltip-name.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
    imports: [
        CommonModule,
        MatTooltipModule
    ],
    exports: [CommonTooltipNameComponent],
    declarations: [CommonTooltipNameComponent],
    providers: [],
})
export class CommonTooltipNameModule { }
