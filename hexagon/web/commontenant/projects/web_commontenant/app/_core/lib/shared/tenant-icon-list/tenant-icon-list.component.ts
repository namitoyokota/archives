import { Component, OnInit, Input, HostBinding, ViewChild, ElementRef } from '@angular/core';

@Component({
    selector: 'hxgn-commontenant-tenant-icon-list',
    styleUrls: ['tenant-icon-list.component.scss'],
    templateUrl: 'tenant-icon-list.component.html'
})

export class IconListComponent implements OnInit {
    /** View child to determine if ellipsis is needed after initialization. */
    @ViewChild('container', { static: true }) container: ElementRef;

    /** Tenant input. */
    @Input() urlList: string[];

    /** Max icons displayed */
    @Input() maxIcons = 4;

    /** The sliced version of the urlList */
    slicedList = [];

    /** Represents if the icons extend past the width of the container element */
    hasScrollbar = false;

    /** the number of hidden icons */
    hiddenIcons = 0;

    constructor() { }

    /**
     * On init lifecycle hook
     */
    ngOnInit() {
        this.slicedList = this.urlList;
        setTimeout(() => {
            this.getTenants();
        }, 200);
    }

    /** Get the number of icons to display */
    getTenants() {
        if (this.container.nativeElement.offsetWidth < this.container.nativeElement.scrollWidth) {
            const iconWidth = 22;
            const numIcons = this.container.nativeElement.offsetWidth / iconWidth;
            this.slicedList = this.urlList.slice(0, numIcons - 1);
            this.hiddenIcons = this.urlList.length - numIcons - 1;
            this.hasScrollbar = true;
        } else {
            this.slicedList = this.urlList;
        }
    }
}
