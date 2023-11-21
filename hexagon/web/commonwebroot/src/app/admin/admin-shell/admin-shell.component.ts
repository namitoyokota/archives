
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationService } from '../../main-menu/navigation.service';
import { AdminMenuData, AdminService } from '../admin.service';
import { Router } from '@angular/router';
import { CommonidentityAdapterService$v1, UserInfo$v1 } from '@galileo/web_commonidentity/adapter';
import { CommonWindowCommunicationService } from '@galileo/web_common-http';
import { MatDialog } from '@angular/material/dialog';
import { AboutDialogComponent } from 'src/app/about-dialog/about-dialog.component';
import {
    Claims as LayoutManagerClaims,
    capabilityId as LayoutManagerCapabilityId
} from '@galileo/web_commonlayoutmanager/adapter';
import { Observable, Subject } from 'rxjs';
import { AdminShellTranslatedTokens, AdminShellTranslationTokens } from './admin-shell.translation';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { takeUntil } from 'rxjs/operators';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'hxgn-root-admin-shell',
    templateUrl: 'admin-shell.component.html',
    styleUrls: ['admin-shell.component.scss']
})
export class AdminShellComponent implements OnInit, OnDestroy {

    /** The currently logged in user */
    user: UserInfo$v1;

    /** List of menu data */
    menuItems$: Observable<AdminMenuData[]>;

    /** Translated tokens */
    tTokens: AdminShellTranslatedTokens = {} as AdminShellTranslatedTokens;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private mainMenuService: NavigationService,
        private adminService: AdminService,
        private router: Router,
        public identitySrv: CommonidentityAdapterService$v1,
        private windowCommSrv: CommonWindowCommunicationService,
        private dialog: MatDialog,
        private localizationSrv: CommonlocalizationAdapterService$v1
    ) { }

    /** Expose common layout manager claims to HTML */
    layoutManagerClaims: typeof LayoutManagerClaims = LayoutManagerClaims;

    /** Capability id for layout manager */
    readonly layoutManagerCapabilityId = LayoutManagerCapabilityId;

    /** Function run on component initialization. */
    ngOnInit() {
        this.initLocalization();
        this.identitySrv.getUserInfoAsync().then(user => {
            this.user = user;
        });

        this.menuItems$ = this.adminService.menuItems$;

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

    /** Shows main menu. */
    showMenu() {
        this.mainMenuService.openMainMenu();
    }

    /** Hides main menu. */
    closeMenu() {
        this.mainMenuService.closeMainMenu();
    }

    /** Determines current menu state. */
    menuState(): boolean {
        return this.mainMenuService.mainMenuState === 'in';
    }

    /** Gets menu title token. */
    getMenuTitleToken(): string {
        return this.adminService.menuTitleToken;
    }

    /** Navigates to main product home page. */
    navToMainProduct(): void {
        this.closeMenu();
        this.router.navigateByUrl('/');
    }

    /** Opens help window. */
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

    /** Opens about dialog. */
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

    /** Set up routine for localization */
    private async initLocalization(): Promise<void> {
        const tokens: string[] = Object.keys(AdminShellTranslationTokens).map(k => AdminShellTranslationTokens[k]);
        const translatedTokens = await this.localizationSrv.getTranslationAsync(tokens);

        this.tTokens.about = translatedTokens[AdminShellTranslationTokens.about];
        this.tTokens.help = translatedTokens[AdminShellTranslationTokens.help];
    }
}
