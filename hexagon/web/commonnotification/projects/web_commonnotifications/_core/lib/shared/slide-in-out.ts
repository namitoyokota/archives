import { animate, style, transition, trigger } from '@angular/animations';

export const slideInOut =  trigger('slideInOut', [
    transition(':enter', [
        style({transform: 'translateX(100%)'}),
        animate('600ms ease-out', style({transform: 'translateX(0%)'}))
    ]),
    transition(':leave', [
        animate('600ms ease-out', style({transform: 'translateX(100%)'}))
    ])
]);
