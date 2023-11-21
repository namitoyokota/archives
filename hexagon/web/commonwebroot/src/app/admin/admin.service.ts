
import { Injectable } from '@angular/core';
import { CommonfeatureflagsAdapterService$v1 } from '@galileo/web_commonfeatureflags/adapter';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { CommontenantAdapterService$v1 } from '@galileo/web_commontenant/adapter';
import { BehaviorSubject } from 'rxjs';

export enum AdminMenuSections {
    system = 'System',
    onboarding = 'Onboarding',
    troubleshooting = 'Troubleshooting'
}

export interface AdminMenuData {
    /** The route path */
    path?: string;

    /** If is a child path this can be used to put the item under its parent */
    parentId?: string;

    /** URL to the menu icon */
    menuIconUrl?: string;

    /** Feature flag that required for this menu item */
    featureFlag?: string;

    /** Token for the name of the menu item */
    nameToken?: string;

    /** Translated name of the menu item */
    name?: string;

    /** Claim that protects the route */
    claimGuard?: string;

    /** Is true if this item is for provisioners */
    provisioner?: boolean;

    /** The section the item should be under */
    section?: AdminMenuSections;

    /** UI to quick link icon. Is blank if not a quick link */
    quickLinkIconUrl?: string;

    /** ID the claim belongs to */
    capabilityId?: string;

}

@Injectable()
export class AdminService {
    /** Menu title token string. Initially null. */
    menuTitleToken: string = null;

    private menuItems = new BehaviorSubject<AdminMenuData[]>([]);

    /** List of menu items */
    menuItems$ = this.menuItems.asObservable();

    constructor(
        private localizationAdapter: CommonlocalizationAdapterService$v1,
        private identityAdapter: CommonidentityAdapterService$v1,
        private ffAdapter: CommonfeatureflagsAdapterService$v1,
        private tenantAdapter: CommontenantAdapterService$v1
    ) {
        this.createMenuDataAsync();
    }

    private async createMenuDataAsync(): Promise<void> {

        const capabilityId = 'webroot';
        const user = await this.identityAdapter.getUserInfoAsync();
        let menuData: AdminMenuData[] = [];

        // Build menu data list
        await this.tenantAdapter.getCapabilityListAsync(capabilityId).then(data => {
            data.forEach((d: any) => {

                for (const itemList of d.compatible.filter(c => c.capabilityId === capabilityId)) {

                    for (const i of itemList.options.adminMenuItems) {
                        i.capabilityId = d.id;

                        menuData.push(i);
                    }
                }
            });
        });

        // Filter out menu items that are not available to the user.
        menuData = menuData.filter(m => {
            if (!m.featureFlag) {
                return true;
            }

            return this.ffAdapter.isActive(m.featureFlag);
        }).filter(m => {
            if (!m.claimGuard) {
                return true;
            }

            const list = user.capabilityClaims.get(m.capabilityId);
            if (list) {
                return list.some(c => c === m.claimGuard);
            }

            return false;
        });

        // Translate tokens
        const tokenList = menuData.map(i => i.nameToken);
        this.localizationAdapter.localizeStringsAsync(tokenList).then(async (names) => {

            for (const i of  menuData) {
                i.name = await this.localizationAdapter.getTranslationAsync(i.nameToken);
            }

            // Sort list
            const sortedList = menuData.sort((a, b) => {
                const aName = a.name.toLocaleLowerCase();
                const bName = b.name.toLocaleLowerCase();
                if (aName < bName) {
                    return -1;
                } else if (aName > bName) {
                    return 1;
                } else {
                    return 0;
                }
            });

            // Set list
            this.menuItems.next(sortedList);
        });
    }
}
