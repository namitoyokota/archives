// slides.component.ts

import { Component, ViewEncapsulation } from '@angular/core';

import SwiperCore, { Keyboard, Navigation, Pagination, Virtual } from 'swiper';

SwiperCore.use([Keyboard, Pagination, Navigation, Virtual]);

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
    /** List of images to display in gallery */
    readonly images = [
        '/assets/JAN_2110.jpg',
        '/assets/JAN_2113.jpg',
        '/assets/JAN_2146.jpg',
        '/assets/JAN_2214.jpg',
        '/assets/JAN_2574.jpg',
        '/assets/JAN_2582.jpg',
        '/assets/JAN_2643.jpg',
        '/assets/JAN_2704.jpg',
        '/assets/JAN_2711.jpg',
        '/assets/JAN_3144.jpg',
        '/assets/JAN_3179.jpg',
        '/assets/JAN_3375.jpg',
        '/assets/JAN_3564.jpg',
        '/assets/JAN_3593.jpg',
        '/assets/JAN_3727.jpg',
        '/assets/JAN_3736.jpg',
        '/assets/JAN_3850.jpg',
        '/assets/JAN_4728.jpg',
        '/assets/JAN_4732.jpg',
        '/assets/JAN_5066.jpg',
        '/assets/JAN_5633.jpg',
        '/assets/JAN_5328.jpg',
        '/assets/JAN_5468.jpg',
        '/assets/JAN_2161.jpg',
        '/assets/JAN_2158.jpg',
        '/assets/JAN_2164.jpg',
        '/assets/JAN_4137.jpg',
    ];
}
