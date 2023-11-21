import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonChipComponent } from './common-chip.component';

@NgModule({
    imports: [CommonModule],
    exports: [CommonChipComponent],
    declarations: [CommonChipComponent]
})
export class CommonChipModule {}
