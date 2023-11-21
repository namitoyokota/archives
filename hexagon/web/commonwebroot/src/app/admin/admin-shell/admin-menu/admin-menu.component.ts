import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonWindowCommunicationService } from '@galileo/web_common-http';
import { NavigationService } from '../../../main-menu/navigation.service';

import { CommonfeatureflagsAdapterService$v1 } from '@galileo/web_commonfeatureflags/adapter';
import {
    CommonidentityAdapterService$v1,
    UserInfo$v1,
} from '@galileo/web_commonidentity/adapter';

import { capabilityId as LayoutManagerCapabilityId, Claims as LayoutManagerClaims } from '@galileo/web_commonlayoutmanager/adapter';

import { AboutDialogComponent } from '../../../about-dialog/about-dialog.component';
import { AdminMenuData, AdminMenuSections } from '../../admin.service';
import { TranslationTokens } from './admin-menu.translation';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'hxgn-root-admin-menu',
    templateUrl: 'admin-menu.component.html',
    styleUrls: ['admin-menu.component.scss']
})
export class AdminMenuComponent implements OnInit {

    /**
     * Menu Items
     */
    // eslint-disable-next-line @angular-eslint/no-input-rename
    @Input('menuItems')
    set setMenuItems(items: AdminMenuData[]) {
        /** Items by section */
        this.menuItemsBySection = new Map<string, AdminMenuData[]>();

        /** Items that belong to a parent */
        this.menuItemsByParent = new Map<string, AdminMenuData[]>();


        // Create mapping of menu items by parent id
        items.forEach(menuItem => {
            if (menuItem.parentId && !!menuItem.path) {
                if (this.menuItemsByParent.has(menuItem.parentId)) {
                    const foundItems = this.menuItemsByParent.get(menuItem.parentId);
                    this.menuItemsByParent.set(menuItem.parentId, [...foundItems, menuItem]);
                } else {
                    this.menuItemsByParent.set(menuItem.parentId, [menuItem]);
                }
            }
        });

        // Create mapping of menu items by section
        items.forEach(menuItem => {
            if (menuItem.section && ((!!menuItem.path && !menuItem.parentId) ||
                (!menuItem.path && !!menuItem.parentId &&
                this.menuItemsByParent.get(menuItem.parentId)?.length)
            )) {
                if (this.menuItemsBySection.has(menuItem.section)) {
                    const foundItems = this.menuItemsBySection.get(menuItem.section);
                    this.menuItemsBySection.set(menuItem.section, [...foundItems, menuItem]);
                } else {
                    this.menuItemsBySection.set(menuItem.section, [menuItem]);
                }
            }
        });
    }

    /** The currently logged in user */
    user: UserInfo$v1;

    /** Expose common layout manager claims to HTML */
    layoutManagerClaims: typeof LayoutManagerClaims = LayoutManagerClaims;

    /** Capability id for layout manager */
    readonly layoutManagerCapabilityId = LayoutManagerCapabilityId;

    /** Expose translation tokens to html template */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Expose AdminMenuSections to HTML */
    adminMenuSections: typeof AdminMenuSections = AdminMenuSections;


    /** List of admin menu sections */
    menuSections: any[] = [
        {
            section: AdminMenuSections.system,
            token: 'commonwebroot-admin.component.systemSettings'
        },
        {
            section: AdminMenuSections.onboarding,
            token: 'commonwebroot-admin.component.onboarding'
        },
        {
            section: AdminMenuSections.troubleshooting,
            token: 'commonwebroot-admin.component.troubleshooting'
        }
    ];

    /** Items by section */
    menuItemsBySection = new Map<string, AdminMenuData[]>();

    /** Items that belong to a parent */
    menuItemsByParent = new Map<string, AdminMenuData[]>();

    constructor(
        private windowCommSrv: CommonWindowCommunicationService,
        private dialog: MatDialog,
        private ffAdapter: CommonfeatureflagsAdapterService$v1,
        public identitySrv: CommonidentityAdapterService$v1,
        private mainMenuService: NavigationService
    ) { }

    /** Function run on component initialization. */
    async ngOnInit() {
        this.user = await this.identitySrv.getUserInfoAsync();
    }

    /** 
     * Logs out user. 
     */
    logOut(): void {
        if (this.windowCommSrv.isChildWindow()) {
            this.windowCommSrv.messageMaster({
                contextId: 'MAIN_LOGOFF',
                handleId: null,
                data: null
            });
        } else {
            this.windowCommSrv.destroyAll();
            this.identitySrv.logoff();
        }
    }

    /** 
     * Opens help window.
     */
    openHelp() {
        if (this.windowCommSrv.isChildWindow()) {
            this.windowCommSrv.messageMaster({
                contextId: 'ADMIN_HELP',
                handleId: null,
                data: null
            });
        } else {
            const hostname = window.location.hostname;
            let screenUrl = '/help/admin';
            const handle = 'admin-help';

            if (hostname !== 'localhost') {
                screenUrl = '/webroot/help/admin';
            }

            if (this.windowCommSrv.hasHandle(handle)) {
                this.windowCommSrv.setFocus(handle);
            } else {
                this.windowCommSrv.createHandle(handle,
                    window.open(`${screenUrl}`));
            }
        }
    }

    /** 
     * Opens about dialog.
     */
    openAboutDialog() {
        this.dialog.open(AboutDialogComponent, {
            width: '1042px',
            panelClass: 'dialog-reset',
            autoFocus: false,
            data: {
                isAdmin: true
            }
        });
    }

    /**
     * Sends the user to the user profile page
     */
     navToUserProfile(): void {
        if (this.windowCommSrv.isChildWindow()) {
            this.windowCommSrv.messageMaster({
                contextId: 'OPEN_USER_PROFILE',
                handleId: null,
                data: null
            });
        } else {
            const port = window.location.port;
            let screenUrl = '/userprofile';

            if (port !== '4200') {
                screenUrl = '/webroot/userprofile';
            }

            if (!this.windowCommSrv.hasHandle('userprofile')) {
                this.windowCommSrv.createHandle('userprofile',
                    window.open(`${screenUrl}`));
            } else {
                this.windowCommSrv.setFocus('userprofile');
            }

            this.mainMenuService.closeMainMenu();
        }
    }
}
