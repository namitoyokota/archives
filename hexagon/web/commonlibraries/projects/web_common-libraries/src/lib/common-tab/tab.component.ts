import { Component, Input, HostBinding, OnInit } from '@angular/core';


@Component({
    selector: 'hxgn-common-tabs',
    templateUrl: './tab.component.html',
    styleUrls: ['./tab.component.scss']
})
export class CommonTabComponent implements OnInit {
    /** String representing a light theme */
    readonly light = 'light';

    /** String representing a dark theme */
    readonly dark = 'dark';

    /** Used to set a dark or light theme */
    @Input() theme = this.light;

    /** Sets the theme through the DOM */
    @HostBinding('class.dark') showDarkTheme = false;

    /** Ng */
    ngOnInit() {
        this.showDarkTheme = (this.theme === this.dark);
    }
}
