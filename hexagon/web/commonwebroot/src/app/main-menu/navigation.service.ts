import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
    providedIn:'root'
})
export class NavigationService {
    /** Describes whether the state of the menu is visible or hidden */
    mainMenuState = 'in';

    /** The path to the current page */
    currentRouteId = '';

    /** Describes whether the route changes */
    RouteChanging = false;

    /** Emits an event when the menu toggle animation has completed */
    onMainMenuToggled: Subject<any> = new Subject();

    /** Emits an event when the about dialog is opened */
    openAboutDialogSub: Subject<any> = new Subject();

    constructor(private router: Router) { }

    /**
     * Toggles the state of the main menu between visible and hidden
     */
    toggleMainMenu(): void {
        this.mainMenuState = this.mainMenuState === 'out' ? 'in' : 'out';
    }

    /**
     * Makes the main menu visible if it is hidden
     */
    openMainMenu(): void {
        this.mainMenuState = 'out';
    }

    /** Hides the main menu if it is visible */
    closeMainMenu(): void {
        this.mainMenuState = 'in';
    }

    /**
     * Gets the path to the current page
     */
    getCurrentRoute(): string {
        return this.router.url;
    }

    /**
     * Navigates to a specified page defined by the router link
     * @param routerLink A path to a page
     * @param data Optional data to add to the path
     */
    navigate(routerLink: string, data?: any): void {
        this.router.navigate((data ? [routerLink, data] : [routerLink]));
    }

    /**
     * Emits an event when the about dialog is opened
     */
    openAboutDialog(): void {
        this.openAboutDialogSub.next();
    }
}
