import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class NavigationService {
    /** Tracks previously viewed page */
    previousPage: string = 'home';

    constructor(private router: Router) {}

    /**
     * Navigates to previously viewed page if exists
     */
    goToPreviousPage(): void {
        if (this.previousPage) {
            this.router.navigate([this.previousPage]);
        } else {
            this.goToHomePage();
        }
    }

    /**
     * Navigates user to home page
     */
    goToHomePage(): void {
        this.router.navigate(['home']);
        this.previousPage = 'home';
    }

    /**
     * Navigates user to admin page
     */
    goToAdminPage(): void {
        this.router.navigate(['admin']);
    }

    /**
     * Navigates user to history page
     */
    goToHistoryPage(): void {
        this.router.navigate(['history']);
        this.previousPage = 'history';
    }

    /**
     * Navigates user to print page
     * @param id Identifier for the print
     */
    goToPrintPage(id?: number): void {
        if (id) {
            this.router.navigate(['print', id]);
        } else {
            this.router.navigate(['print']);
        }
    }
}
