import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-loader',
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {

    /** Whether or not to show the admin loading screen. */
    @Input() isAdmin = false;

    constructor() { }
}
