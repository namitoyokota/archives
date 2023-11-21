import { Component, Input } from '@angular/core';
import { UrlHelper } from '@galileo/web_common-http';
import { CompositeIcon$v1, CompositeIconMember$v1 } from '@galileo/web_commonkeywords/_common';

import { PrimitiveIconStoreService } from '../primitivie-icon-store.service';

@Component({
    selector: 'hxgn-commonkeywords-composite-icon',
    templateUrl: 'composite-icon.component.html',
    styleUrls: ['composite-icon.component.scss']
})

export class CompositeIconComponent {

    /** Composite icon */
    @Input() icon: CompositeIcon$v1;

    /** Height and width of icon */
    @Input() size: number;

    private readonly baseSize = 394;

    constructor(private primitiveIconStore: PrimitiveIconStoreService) { }

    /**
     * Returns the correct icon url based on settings
     */
    getIconUrl(icon: CompositeIconMember$v1): string {
        if (!icon) {
            return null;
        }

        const foundIcon = this.primitiveIconStore.get(icon.primitiveIconId);

        if (!foundIcon) {
            return null;
        }

        if (icon.options.showStroke) {
            return UrlHelper.mapMediaUrl(foundIcon.urlWithStroke);
        } else {
            return UrlHelper.mapMediaUrl(foundIcon.url);
        }
    }

    /**
     * Get the scaled value
     */
    scaledValue(n: number): number {
        const scale = this.size / this.baseSize;
        return n * scale;
    }

}
