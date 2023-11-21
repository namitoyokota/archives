import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonWindowCommunicationService } from '@galileo/web_common-http';
import { PopoverPosition } from '@galileo/web_common-libraries';
import { NavigationService } from '../main-menu/navigation.service';
import { CommonidentityAdapterService$v1, UserInfo$v1 } from '@galileo/web_commonidentity/adapter';
import { capabilityId, Claims } from '@galileo/web_commonlayoutmanager/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { CommontenantAdapterService$v1, Tenant$v1 } from '@galileo/web_commontenant/adapter';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AboutDialogComponent } from '../about-dialog/about-dialog.component';
import { TranslationTokens } from './tenant-menu.translation';

enum WindowHandles {
    admin = 'admin',
    userProfile = 'userprofile'
}

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'tenant-menu',
    templateUrl: './tenant-menu.component.html',
    styleUrls: ['./tenant-menu.component.scss']
})
export class TenantMenuComponent implements OnInit, OnDestroy {

    /** Signifies if the menu is in the Admin location */
    @Input() inAdmin = false;

    /** User info */
    // eslint-disable-next-line @angular-eslint/no-input-rename
    @Input('user')
    set setUser(user: UserInfo$v1) {
        if (user) {
            this.user = user;
            this.initTenantInfoAsync();
        }
    }

    /** The users active tenant */
    activeTenant: BehaviorSubject<Tenant$v1> = new BehaviorSubject<Tenant$v1>(null);

    /** Bus for active tenant. */
    activeTenant$: Observable<Tenant$v1> = this.activeTenant.asObservable();

    /** The capability id for common layout manager */
    layoutManagerCapabilityId = capabilityId;

    /** Expose common layout manager UI claims to the UI */
    layoutManagerClaims: typeof Claims = Claims;

    /** The users non-active tenants */
    otherTenants: Tenant$v1[] = [];

    /** Popover position. */
    popoverPosition: PopoverPosition = PopoverPosition.belowLeft;

    /** A flag that is true when a loading screen should be shown */
    showLoading = false;

    /** Expose translation tokens to html template */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Current user */
    user: UserInfo$v1;

    /** A flag that is true if the menu is open */
    isMenuOpen = false;

    /** Translated word for account */
    accountText = '';

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private dialog: MatDialog,
        private identitySrv: CommonidentityAdapterService$v1,
        private mainMenuSrv: NavigationService,
        private tenantSrv: CommontenantAdapterService$v1,
        private windowCommSrv: CommonWindowCommunicationService,
        private localizationSrv: CommonlocalizationAdapterService$v1
    ) { }

    /**
     * On init lifecycle
     */
    ngOnInit(): void {
        this.initLocalization();

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalization();
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /**
     * Put app in away mode
     */
    awayMode(): void {
        this.identitySrv.lockAppAsync();
    }

    /**
     * Changes the active tenant
     */
    changeTenant(tenant: Tenant$v1): void {
        this.showLoading = true;
        this.identitySrv.changeActiveTenantAsync(tenant.id).then(() => {
            if (this.windowCommSrv.isChildWindow()) {
                this.windowCommSrv.messageMaster({
                    contextId: 'RELOAD_PAGE',
                    handleId: null,
                    data: null
                });
            } else {
                const hostname = window.location.hostname;
                if (hostname !== 'localhost') {
                    window.location.href = '/webroot';
                } else {
                    window.location.href = '/';
                }
            }
        });
    }

    /**
     * Sends the user to the log out screen
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
     * Sends the user to the admin view of the product
     */
    navToAdminView(): void {
        if (this.windowCommSrv.isChildWindow()) {
            this.windowCommSrv.messageMaster({
                contextId: 'OPEN_ADMIN',
                handleId: null,
                data: null
            });
        } else {
            const port = window.location.port;
            let screenUrl = '/admin';

            if (port !== '4200') {
                screenUrl = '/webroot/admin';
            }

            if (!this.windowCommSrv.hasHandle(WindowHandles.admin)) {
                this.windowCommSrv.createHandle(WindowHandles.admin, window.open(`${screenUrl}`));
            } else {
                this.windowCommSrv.setFocus(WindowHandles.admin);
            }

            this.mainMenuSrv.closeMainMenu();
        }
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

            if (!this.windowCommSrv.hasHandle(WindowHandles.userProfile)) {
                this.windowCommSrv.createHandle(WindowHandles.userProfile, window.open(`${screenUrl}`));
            } else {
                this.windowCommSrv.setFocus(WindowHandles.userProfile);
            }

            this.mainMenuSrv.closeMainMenu();
        }
    }

    /**
     * Opens about dialog
     */
    openAboutDialog(): void {
        this.dialog.open(AboutDialogComponent, {
            width: '1042px',
            panelClass: 'dialog-reset',
            autoFocus: false,
            data: {
                isAdmin: this.inAdmin
            }
        });
    }

    /**
     * Inits tenant info after user has loaded
     */
    private async initTenantInfoAsync(): Promise<void> {

        const tenants: Tenant$v1[] = await this.tenantSrv.getUserTenantsAsync();
        tenants.forEach((tenant: Tenant$v1) => {
            if (this.user.activeTenant === tenant.id) {
                this.activeTenant.next(tenant);
            } else {
                this.otherTenants.push(tenant);
            }
        });
    }

    /** Set up routine for localization */
    private async initLocalization(): Promise<void> {
        const tokens: string[] = Object.keys(TranslationTokens).map(k => TranslationTokens[k]);
        const translatedTokens = await this.localizationSrv.getTranslationAsync(tokens);

        this.accountText = translatedTokens[TranslationTokens.account];
    }
}
