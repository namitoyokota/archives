import { Component, Input } from '@angular/core';
import { RestrictionLevels$v1 } from '@galileo/web_commontenant/_common';

@Component({
    selector: 'hxgn-commontenant-active-data-filter-item',
    templateUrl: 'active-data-filter-item.component.html',
    styleUrls: ['active-data-filter-item.component.scss']
})

export class ActiveDataFilterItemComponent {
    /** The line item's restriction level */
    @Input() level: RestrictionLevels$v1 = RestrictionLevels$v1.low;

    /** Expose restriction levels to html */
    RestrictionLevels: typeof RestrictionLevels$v1 = RestrictionLevels$v1;

    constructor() { }
}

// Set up template area sections
@Component({
    selector: 'hxgn-commontenant-active-data-filter-item-section',
    template: ` <div class="item">
                    <span>
                        <ng-content select="hxgn-commontenant-active-data-filter-item-section-title"></ng-content>
                    </span>
                    <span>
                        <ng-content select="hxgn-commontenant-active-data-filter-item-section-text"></ng-content>
                    </span>
                </div>`
})
export class ActiveDataFilterItemSectionComponent { }

@Component({
    selector: 'hxgn-commontenant-active-data-filter-item-section-title',
    template: '<ng-content></ng-content>'
})
export class ActiveDataFilterItemTitleSectionComponent { }

@Component({
    selector: 'hxgn-commontenant-active-data-filter-item-section-text',
    template: '<ng-content></ng-content>'
})
export class ActiveDataFilterItemTextSectionComponent { }
