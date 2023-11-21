import { Component } from '@angular/core';
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
    templateUrl: './not-found.component.html',
    styleUrls: ['./not-found.component.scss'],
})
export class NotFoundComponent {
    constructor(private navigationService: NavigationService) {}

    /**
     * Navigates to home page
     */
    goToHomePage(): void {
        this.navigationService.goToHomePage();
    }
}
