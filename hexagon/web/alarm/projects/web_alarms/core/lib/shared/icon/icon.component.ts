import { Component, Input, OnInit } from '@angular/core';
import { Alarm$v1 } from '@galileo/web_alarms/_common';

import { CoreService } from '../../core.service';

@Component({
    selector: 'hxgn-alarms-icon',
    templateUrl: 'icon.component.html',
    styleUrls: ['icon.component.scss']
})

export class IconComponent implements OnInit {

    /** Alarm data */
    @Input() alarm: Alarm$v1;

    /** Flag to indicate marker is shared from another group */
    @Input() showSharedIndicator = false;

    /** Flag that is true when the border should be shown */
    @Input() showBorder = true;

    /** Flag that indicates whether to show the bell icon for priority */
    @Input() showPriority = false;

    /** Flag indicating to add shadow around icon.  Need for map */
    @Input() showShadow = false;

    /** Height and width of the icon */
    @Input() size = 46;

    /** Flag indicating if marker is shared */
    sharedMarker = false;

    constructor(private coreSrv: CoreService) { }

    /**
     * On init life cycle hook
     */
    ngOnInit() {
        if (this.showSharedIndicator) {
            if (this.alarm) {
                this.sharedMarker = this.coreSrv.activeTenantId !== this.alarm.tenantId;
            }
        }
    }
}
