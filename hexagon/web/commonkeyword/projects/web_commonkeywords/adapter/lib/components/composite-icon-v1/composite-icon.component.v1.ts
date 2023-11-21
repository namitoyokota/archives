import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import {
  capabilityId,
  CompositeIcon$v1,
  CompositeIconMember$v1,
  IconCapabilityOptions$v1,
  PrimitiveIcon$v2,
} from '@galileo/web_commonkeywords/_common';
import { CommontenantAdapterService$v1 } from '@galileo/web_commontenant/adapter';

import { CommonkeywordsAdapterService$v1 } from '../../adapter.v1.service';

/**
 * @deprecated Use hxgn-commonkeywords-composite-icon-v2
 */
@Component({
    selector: 'hxgn-commonkeywords-composite-icon-v1',
    templateUrl: 'composite-icon.component.v1.html',
    styleUrls: ['composite-icon.component.v1.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class CompositeIconComponent implements OnInit {

    /** Id of the capability the icon is for */
    @Input() capabilityId: string;

    /** Id of the industry the icon is for */
    @Input() industryId: string;

    /** List of keywords that are used to get an icon */
    @Input() keywords: string[] = [];

    /** Height and width of icon */
    @Input() size: number;

    /** List of primitive icons */
    pIcon: PrimitiveIcon$v2[] = [];

    /** Composite icon to display */
    icon: CompositeIcon$v1;

    /** Icon to use if no composite icon can be found */
    fallBackIconUrl: string;

    /** Flag that is true while the data for the icon is loading */
    loading = true;

    private readonly baseSize = 394;

    constructor(private adapterSrv: CommonkeywordsAdapterService$v1,
        private tenantAdapterSrv: CommontenantAdapterService$v1,
        private cdr: ChangeDetectorRef) { }

    async ngOnInit() {
        await this.loadCompositeIcon();
    }

    /**
     * Returns URL to the primitive icon
     */
    getIconUrl(icon: CompositeIconMember$v1): string {
        if (!icon) {
            return null;
        }

        const foundIcon = this.pIcon.find(item => item && item.id === icon.primitiveIconId);

        if (!foundIcon) {
            return null;
        }

        if (icon?.options?.showStroke) {
            return foundIcon?.urlWithStroke;
        } else {
            return foundIcon?.url;
        }
    }

    /** Get the scale value */
    scaledValue(n: number): number {
        const scale = this.size / this.baseSize;
        return n * scale;
    }

    private async loadCompositeIcon() {
        this.icon = await this.adapterSrv.getCompositeIconFromKeywordsAsync(this.capabilityId, this.industryId, this.keywords);

        if (this.icon) {
            for (const item of this.icon.iconStack) {
                const icon = await this.adapterSrv.getPrimitiveIconAsync(item.primitiveIconId);
                this.pIcon.push(icon);
            }

        } else {
            await this.getFallbackIcon();
        }

        this.loading = false;

        this.cdr.markForCheck();
        this.cdr.detectChanges();

    }

    private async getFallbackIcon() {
        const capabilityList = await this.tenantAdapterSrv.getCapabilityListAsync(capabilityId);

        if (capabilityList && capabilityList.length) {
            const foundCapability = capabilityList.find(c => c.id === this.capabilityId);

            if (foundCapability) {
                // Try to get fallback icon
                const compatible = foundCapability.compatible.find(comp => comp.capabilityId === capabilityId);

                if (compatible) {
                    const options: IconCapabilityOptions$v1 = new IconCapabilityOptions$v1(compatible.options);

                    // Try for industry fallback
                    if (options.industryIcons.has(this.industryId)) {
                        this.fallBackIconUrl = options.industryIcons.get(this.industryId).filePath;
                    } else {
                        // Try for capability fallback
                        this.fallBackIconUrl = options.capabilityIconPath;
                    }

                }
            }
        }
    }

}
