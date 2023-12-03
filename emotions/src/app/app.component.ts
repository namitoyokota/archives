import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    /** List of tabs that have been opened */
    openedTabs: string[] = [];

    /** Last opened tab used for blurring other sections */
    lastOpened: string = '';

    constructor() {}

    /**
     * Updates list of opened tabs and last opened tab
     * @param tabName Toggled tab
     */
    toggleTab(tabName: string): void {
        if (this.openedTabs.includes(tabName)) {
            this.openedTabs = this.openedTabs.filter((tab) => tab !== tabName);
        } else {
            this.openedTabs.push(tabName);
        }

        this.lastOpened = this.openedTabs.length ? this.openedTabs[this.openedTabs.length - 1] : '';
    }

    /**
     * Auto-scrolls to toggled element
     * @param $event Event of the click
     */
    scrollToElement($event: MouseEvent | PointerEvent) {
        document.elementFromPoint($event.clientX, $event.clientY)?.scrollIntoView({
            behavior: 'smooth',
        } as ScrollIntoViewOptions);
    }
}
