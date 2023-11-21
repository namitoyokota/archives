import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatRadioChange } from '@angular/material/radio';
import { PostStyle$v1 } from '@galileo/platform_common-libraries';
import { PostStyleTranslationTokens } from './post-style.menu.translation';

@Component({
    selector: 'hxgn-common-post-style-menu',
    templateUrl: 'post-style-menu.component.html',
    styleUrls: ['post-style-menu.component.scss'],
    animations: [
        trigger('fade', [
            state(':enter', style({ opacity: '*' })),
            state(':leave', style({ opacity: '0' })),
            state('void', style({ opacity: '0' })),
            transition('* => *', animate('400ms ease-in-out'))
        ]),
    ]
})

export class PostStyleMenuComponent {

    /** The selected post style */
    @Input() postStyle: PostStyle$v1 = PostStyle$v1.normal;

    /** A flag when true will position the menu where it will best fit */
    @Input() dynamicPosition = false;

    /** Event when post style updates */
    @Output() postStyleUpdate = new EventEmitter<PostStyle$v1>();

    /** Trigger for mat menu */
    @ViewChild('clickMenuTrigger') clickMenuTrigger: MatMenuTrigger;

    /** Expose PostStyle$v1 to the HTML */
    style: typeof PostStyle$v1 = PostStyle$v1;

    /** A flag that is true if the menu is open */
    isMenuOpen = false;

    /** Expose PostStyleTranslationTokens to HTML */
    tokens: typeof PostStyleTranslationTokens = PostStyleTranslationTokens;

    /** Document has been clicked */
    @HostListener('window:document', ['$event'])
    clickOut(even: MouseEvent): void {
        if (!this.dynamicPosition) {
            this.isMenuOpen = false;
        }
    }

    constructor() { }

    /**
     * Toggle showing post menu
     * @param event Mouse event
     */
    toggleMenu(event: MouseEvent): void {
        event.stopPropagation();
        this.isMenuOpen = !this.isMenuOpen;
    }

    /**
     * Fired when the post style changes
     * @param event Mat radio change event object
     */
    postStyleChange(event: MatRadioChange): void {
        this.postStyle = event.value;
        this.postStyleUpdate.emit(this.postStyle);

        if (this.dynamicPosition) {
            this.clickMenuTrigger.closeMenu();
        } else {
            this.isMenuOpen = false;
        }
    }

}
