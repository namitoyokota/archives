import { NgModule } from '@angular/core';
import { VariableHeightVirtualScrollDirective } from './variable-height-virtual-scroll-strategy.directive';
import { VirtualScrollCardSizeLockDirective } from './virtual-scroll-card-size-lock.directive';


@NgModule({
    imports: [],
    exports: [
        VariableHeightVirtualScrollDirective,
        VirtualScrollCardSizeLockDirective
    ],
    declarations: [
        VariableHeightVirtualScrollDirective,
        VirtualScrollCardSizeLockDirective
    ],
    providers: [],
})
export class VariableHeightVirtualScrollStrategyModule { }
