import { Directive, EventEmitter, HostBinding, Input, Output } from '@angular/core';

// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ selector: '[virtualScrollCardSizeLock]' })
export class VirtualScrollCardSizeLockDirective {

    /** Height binding */
    @HostBinding('style.min-height')
    minHeight = 'fit-content !important';

    /** Is animations disabled */
    @HostBinding('@.disabled')
    get isDisabled(): boolean {
        return this.locked;
    }

    /** Size of card */
    @Input('size')
    set setSize(s: number) {
        this.height = s;
        this.setCardHeight();
    }


    /** Expanded flag */
    @Input('locked')
    set setLock(lock: boolean) {
        this.locked = lock;
        this.setCardHeight();
    }

    // eslint-disable-next-line
    @Output() sizeChange = new EventEmitter<void>();

    private locked = false;
    private height: number;

    constructor() { }

    private setCardHeight(): void {
        if (!this.locked) {
            this.minHeight = 'fit-content';
        } else {
            this.minHeight = this.height + 'px';
        }
    }
}
