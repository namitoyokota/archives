import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'hxgn-commonnotifications-toast-notification-item',
    templateUrl: 'toast-notification-item.component.html',
    styleUrls: ['toast-notification-item.component.scss'],
    animations: [
        trigger('slideIn', [
            transition(':enter', [
                style({transform: 'translateX(100%)'}),
                animate('600ms ease-out', style({transform: 'translateX(0%)'}))
            ])
        ]),
        trigger('pulse', [
            state('hidden', style({ border: '0px solid #242425' })),
            state('shown', style({ border: '0px solid #242425' })),
            transition('hidden => shown', animate('1000ms',  keyframes([
                style({ border: '0px solid #242425', offset: 0 }),
                style({ margin: '10px', offset: 0 }),
                style({ border: '10px solid #242425', offset: 0.25 }),
                style({ margin: '0px', offset: .25 }),
                style({ border: '0px solid #242425', offset: 0.5 }),
                style({ margin: '10px', offset: 0.5 }),
                style({ border: '10px solid #242425', offset: 0.75 }),
                style({ margin: '0px', offset: 0.75 }),
                style({ border: '0px solid #242425', offset: 1 }),
                style({ margin: '10px', offset: 1 }),
                ]))),
        ])
    ]
})

export class ToastNotificationItemComponent {

    /** A flag that is true if animation is enabled */
    @Input() animationEnabled = false;

    /** A flag that is true if the animation should be shown */
    showAnimation = 'hidden';

    constructor() { }

    /**
     * Show pulse animation
     */
    showPulse(event: any): void {
        if (event.fromState !== null && this.animationEnabled) {
            this.showAnimation = 'shown';
        }

    }
}
