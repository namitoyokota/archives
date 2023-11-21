import { CdkOverlayOrigin, ConnectedOverlayPositionChange, ConnectionPositionPair } from '@angular/cdk/overlay';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    Output,
    ViewChild,
} from '@angular/core';
import { UserInfo$v1 } from '@galileo/web_commonidentity/adapter';
import { BehaviorSubject, Observable } from 'rxjs';

import { CommonPopoverTranslationTokens } from './common-popover.translation';

/** List of popover positions the popover can be rendered in. */
export enum PopoverPosition {
    aboveLeft = 'above-left',
    aboveRight = 'above-right',
    belowLeft = 'below-left',
    belowRight = 'below-right',
    leftAbove = 'left-above',
    leftBelow = 'left-below',
    rightAbove = 'right-above',
    rightBelow = 'right-below'
}

/** List of x positions for cdk popover. */
enum XPositions {
    center = 'center',
    end = 'end',
    start = 'start'
}

/** List of y positions for cdk popover. */
enum YPositions {
    bottom = 'bottom',
    center = 'center',
    top = 'top'
}

@Component({
    selector: 'hxgn-common-menu-item',
    template: `
        <img class="menu-item-img" *ngIf="imgSrc" [src]="imgSrc" />
        <span class="menu-item-text">
            <hxgn-commonlocalization-translate-v1 [token]="token" skeletonWidth="50px">
            </hxgn-commonlocalization-translate-v1>
        </span>
    `,
    styles: [`
        :host {
            height: 40px;
            width: 180px;
            display: grid;
            align-items: center;
            box-sizing: border-box;
            font-size: 13px;
            padding: 0 10px;
        }

        :host.disabled {
            opacity: 0.4;
            pointer-events: none;
        }

        :host.has-image {
            grid-template-columns: 20px 1fr;
            column-gap: 10px;
        }

        :host:hover {
            background-color: #F4F4F4;
            cursor: pointer;
        }

        :host:not(:last-of-type) {
            border-bottom: solid 1px #E0E0E0;
        }

        .menu-item-img {
            max-height: 100%;
            max-width: 100%;
            justify-self: center;
        }

        .menu-item-text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommonMenuItemComponent {

    /** Whether or not the menu item should be disabled. */
    @HostBinding('class.disabled') @Input() disabled = false;

    /** Image source for menu item. */
    @HostBinding('class.has-image') @Input() imgSrc: string;

    /** Token string for menu item. */
    @Input() token: string;

    constructor() { }
}

@Component({
    selector: 'hxgn-common-popover',
    templateUrl: 'common-popover.component.html',
    styleUrls: ['common-popover.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommonPopoverComponent {

    /** Backdrop background color. Optional. */
    @Input() backdrop: string;

    /** Prevents popover from closing when backdrop is clicked. Optional. */
    @Input() disableClose: boolean;

    /** User specified height of popover. Optional. */
    @Input() height = '100%';

    /** Whether or not the popover should be open by default. */
    @Input('isShown')
    set setIsShown(isShown: boolean) {
        if (isShown) {
            this.open();
        }
    }

    /** Hides the arrow to display popover as a menu. Optional. */
    @Input() menuMode: boolean;

    /** Origin of popover. Required. */
    @Input() origin: CdkOverlayOrigin;

    /** User specified position of the popover. Optional. */
    @Input() position: PopoverPosition;

    /** Shows the dismiss button. Optional. */
    @Input() showDismiss: boolean;

    /** Shows "Don't Show Again" checkbox */
    @Input() showCheckbox = false;

    /** User specified width of popover. Optional. */
    @Input() width = '100%';

    /** Output for closed event: true to save dont show again check */
    @Output() closed: EventEmitter<boolean> = new EventEmitter<boolean>();

    /** Active class being applied to popover container to determine arrow placement. */
    activeClass = PopoverPosition.belowRight;

    /** The class name of the backdrop. */
    backdropClassName = 'custom-backdrop';

    /** User defined position pair. */
    connectionPositionPairs: ConnectionPositionPair[] = [];

    /** Maximum height of container to prevent overflow on page. */
    maxHeight = '500px';

    /** Maximum height of container to prevent overflow on page. */
    maxWidth = '500px';

    /** Expose translation tokens to html. */
    tokens: typeof CommonPopoverTranslationTokens = CommonPopoverTranslationTokens;

    /** Stores user info object for user personalization. */
    userInfo: UserInfo$v1 = null;

    /** Tracks user personalization status. */
    dontShowAgain = false;

    /** View child for overlay container. */
    @ViewChild('overlayContainer') private overlayContainer: ElementRef;

    /** Tracks status for if the overlay is open or not. */
    private isOpen: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    /** Observable for is open. */
    readonly isOpen$: Observable<boolean> = this.isOpen.asObservable();

    constructor(
        private cdr: ChangeDetectorRef
    ) { }

    /**
     * Closes popover.
     * @param isBackdropClick Tracks if the originating click is from the backdrop
     */
    close(isBackdropClick?: boolean): void {

        // Prevent close if disable close is enabled and the backdrop is selected
        if (!(isBackdropClick && this.disableClose)) {
            this.isOpen.next(false);
            this.closed.emit(this.dontShowAgain);
        }
    }

    /**
     * Handles click event in popover. If in menu mode, popover will be closed on click.
     */
    handlePopoverClick(): void {
        if (this.menuMode) {
            this.close();
        }
    }

    /**
     * Handles arrow position depending on where the menu is rendered
     * @param position Connected overlay position
     */
    handlePosition(position: ConnectedOverlayPositionChange): void {

        // If the user did not provide a position, set active class
        if (!this.position) {
            if (position.connectionPair.originX === XPositions.start) {
                if (position.connectionPair.originY === YPositions.top) {
                    this.activeClass = PopoverPosition.aboveRight;
                } else {
                    this.activeClass = PopoverPosition.belowRight;
                }
            } else {
                if (position.connectionPair.originY === YPositions.top) {
                    this.activeClass = PopoverPosition.aboveLeft;
                } else {
                    this.activeClass = PopoverPosition.belowLeft;
                }
            }
        }

        this.setCenterPoint();
        this.setMaxWidth();
        this.cdr.detectChanges();
    }

    /**
     * Opens popover
     * @param $event Mouse event to stop propagation if defined
     */
    open($event?: MouseEvent): void {
        if ($event) {
            $event.stopPropagation();
        }

        this.openPopover();
    }

    /**
     * Converts offset to a number for width calculations
     * @param offset Offset value
     */
    private convertWidthOffset(offset: string): number {
        return +offset.split('px')[0];
    }

    /**
     * Opens popover when called from open()
     */
    private openPopover(): void {

        // If user defined position, set connection pair.
        if (this.position) {
            switch (this.position) {
                case PopoverPosition.aboveLeft:
                    this.connectionPositionPairs.push(new ConnectionPositionPair(
                        { originX: XPositions.end, originY: YPositions.top },
                        { overlayX: XPositions.end, overlayY: YPositions.bottom }
                    ));
                    break;
                case PopoverPosition.aboveRight:
                    this.connectionPositionPairs.push(new ConnectionPositionPair(
                        { originX: XPositions.start, originY: YPositions.top },
                        { overlayX: XPositions.start, overlayY: YPositions.bottom }
                    ));
                    break;
                case PopoverPosition.belowLeft:
                    this.connectionPositionPairs.push(new ConnectionPositionPair(
                        { originX: XPositions.end, originY: YPositions.bottom },
                        { overlayX: XPositions.end, overlayY: YPositions.top }
                    ));
                    break;
                case PopoverPosition.belowRight:
                    this.connectionPositionPairs.push(new ConnectionPositionPair(
                        { originX: XPositions.start, originY: YPositions.bottom },
                        { overlayX: XPositions.start, overlayY: YPositions.top }
                    ));
                    break;
                case PopoverPosition.leftAbove:
                    this.connectionPositionPairs.push(new ConnectionPositionPair(
                        { originX: XPositions.start, originY: YPositions.center },
                        { overlayX: XPositions.end, overlayY: YPositions.bottom }
                    ));
                    break;
                case PopoverPosition.leftBelow:
                    this.connectionPositionPairs.push(new ConnectionPositionPair(
                        { originX: XPositions.start, originY: YPositions.bottom },
                        { overlayX: XPositions.end, overlayY: YPositions.center }
                    ));
                    break;
                case PopoverPosition.rightAbove:
                    this.connectionPositionPairs.push(new ConnectionPositionPair(
                        { originX: XPositions.end, originY: YPositions.center },
                        { overlayX: XPositions.start, overlayY: YPositions.bottom }
                    ));
                    break;
                case PopoverPosition.rightBelow:
                    this.connectionPositionPairs.push(new ConnectionPositionPair(
                        { originX: XPositions.end, originY: YPositions.bottom },
                        { overlayX: XPositions.start, overlayY: YPositions.center }
                    ));
                    break;
                default:
                    console.error('Invalid position!');
            }

            this.activeClass = this.position;
        }

        this.setMaxHeight();
    }

    /**
     * Calculates the center point of the origin to set arrow positioning
     */
    private setCenterPoint(): void {
        if (!this.menuMode) {
            const arrowCenter = 24.04; // Center point of arrow
            const originHeight = this.origin.elementRef.nativeElement.offsetHeight; // Width of height for popover
            const originWidth = this.origin.elementRef.nativeElement.offsetWidth; // Width of trigger for popover

            // If it is rendered above or below, move left or right. Otherwise, move up or down.
            if (this.activeClass === PopoverPosition.aboveLeft || this.activeClass === PopoverPosition.aboveRight
                || this.activeClass === PopoverPosition.belowLeft || this.activeClass === PopoverPosition.belowRight) {

                const arrowOffset = 30; // Offset of arrow
                const offset = (originWidth / 2) - arrowCenter - arrowOffset + 'px';
                if (this.activeClass === PopoverPosition.aboveLeft || this.activeClass === PopoverPosition.belowLeft) {
                    this.overlayContainer.nativeElement.style.right = offset;
                } else {
                    this.overlayContainer.nativeElement.style.left = offset;
                }
            } else {
                const arrowOffset = 39; // Offset of arrow
                const offset = (originHeight / 2) - arrowCenter - arrowOffset + 'px';
                if (this.activeClass === PopoverPosition.leftAbove || this.activeClass === PopoverPosition.rightAbove) {
                    this.overlayContainer.nativeElement.style.bottom = offset;
                }
            }
        }
    }

    /**
     * Sets max height of popover to prevent page overflow.
     */
    private setMaxHeight(): void {

        // Get height of page to determine distance from bottom.
        const body = document.body;
        const html = document.documentElement;
        const pageHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

        // How far the trigger is from the top of the page
        const distanceFromTop = this.origin.elementRef.nativeElement.getBoundingClientRect().top + html.scrollTop;

        /** How far the trigger is from the bottom of the page. */
        const distanceFromBottom = pageHeight - distanceFromTop;

        /** How tall the trigger is. */
        const triggerHeight = this.origin.elementRef.nativeElement.offsetHeight;

        // Gives 20px of space before reaching border of page
        const pageMargin = 20;

        /** How much space exists between content and trigger due to arrow. */
        const arrowHeight = !this.menuMode ? 35 : 2;

        // Max height of popover.
        let maxHeight = 0;

        // If the user position is defined above or it is automatically rendered above, set max height from bottom
        if (this.position ?
            this.position === PopoverPosition.aboveLeft || this.position === PopoverPosition.aboveRight :
            distanceFromTop > distanceFromBottom) {
            maxHeight = pageHeight - distanceFromBottom - pageMargin - arrowHeight;
        } else {
            maxHeight = pageHeight - distanceFromTop - triggerHeight - pageMargin - arrowHeight;
        }

        // If there is enough space for the popover, render as normal.
        if (maxHeight >= 120) {
            this.maxHeight = maxHeight + 'px';
            this.isOpen.next(true);

            // If backdrop is specified, wait until next angular tick to set it.
            if (this.backdrop) {
                setTimeout(() => {
                    const backdrop: HTMLElement = <HTMLElement>document.getElementsByClassName(this.backdropClassName)[0];
                    backdrop.style.backgroundColor = this.backdrop;
                });
            }
        } else { // Otherwise, flip position and recalculate
            if (this.position === PopoverPosition.aboveLeft || this.position === PopoverPosition.aboveRight ||
                this.position === PopoverPosition.belowLeft || this.position === PopoverPosition.belowRight) {
                if (this.position === PopoverPosition.aboveLeft) {
                    this.position = PopoverPosition.belowLeft;
                } else if (this.position === PopoverPosition.aboveRight) {
                    this.position = PopoverPosition.belowRight;
                } else if (this.position === PopoverPosition.belowLeft) {
                    this.position = PopoverPosition.aboveLeft;
                } else if (this.position === PopoverPosition.belowRight) {
                    this.position = PopoverPosition.aboveRight;
                }

                this.connectionPositionPairs = [];
                this.openPopover();
            }
        }
    }

    /**
     * Sets max width of popover to prevent page overflow
     */
    private setMaxWidth(): void {

        // Get width of page to determine distance.
        const body = document.body;
        const html = document.documentElement;
        const pageWidth = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);

        // How far the trigger is from the left of the page
        const distanceFromLeft = this.origin.elementRef.nativeElement.getBoundingClientRect().left + html.scrollLeft;

        /** How far the trigger is from the right of the page. */
        const distanceFromRight = pageWidth - distanceFromLeft;

        /** How wide the trigger is. */
        const triggerWidth = this.origin.elementRef.nativeElement.offsetWidth;

        // Gives 20px of space before reaching border of page
        const pageMargin = 20;

        /** How much space exists between content and trigger due to arrow. */
        const arrowWidth = 35;

        /** Offset of popover after positioning. */
        let offset = 0;

        if (this.position === PopoverPosition.aboveLeft || this.position === PopoverPosition.belowLeft) {
            offset = this.convertWidthOffset(this.menuMode ? '2px' : this.overlayContainer.nativeElement.style.right);
            this.maxWidth = distanceFromLeft + triggerWidth - pageMargin - offset + 'px';
        } else if (this.position === PopoverPosition.aboveRight || this.position === PopoverPosition.belowRight) {
            offset = this.convertWidthOffset(this.menuMode ? '2px' : this.overlayContainer.nativeElement.style.left);
            this.maxWidth = distanceFromRight - pageMargin - offset + 'px';
        } else if (this.position === PopoverPosition.leftAbove || this.position === PopoverPosition.leftBelow) {
            this.maxWidth = distanceFromLeft - arrowWidth - pageMargin + 'px';
        } else {
            this.maxWidth = distanceFromRight - triggerWidth - arrowWidth - pageMargin + 'px';
        }
    }
}
