import { Component, HostListener, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import * as LayoutAdapter from '@galileo/web_commonlayoutmanager/adapter';
// Builder can use this only bc it is part of the same feature and this is the root app
import * as LayoutCore from '@galileo/web_commonlayoutmanager/_core';

import { CommonWindowCommunicationService, CommonHubManagerService } from '@galileo/web_common-http';
import { filter, first, takeUntil } from 'rxjs/operators';
import { CommonidentityAdapterService$v1, UserInfo$v1 } from '@galileo/web_commonidentity/adapter';
import { LayoutCompilerService } from './layout-compiler.service';
import { NavigationService } from '../main-menu/navigation.service';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { capabilityId, Claims } from '@galileo/web_commonlayoutmanager/adapter';

import { MatDialog } from '@angular/material/dialog';
import { AboutDialogComponent } from '../about-dialog/about-dialog.component';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject, from, Subject } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { PhysicalWorkspace$v1 } from '@galileo/web_commonlayoutmanager/adapter';

enum TranslationTokens {
    workspaceSettings = 'commonwebroot-main.component.workspaceSettings',
    administrator = 'commonwebroot-main.component.administrator',
    resources = 'commonwebroot-main.component.resources',
    about = 'commonwebroot-main.component.about',
    help = 'commonwebroot-main.component.help',
    initializing = 'commonwebroot-main.loader.initializing',
    copyright = 'commonwebroot-main.loader.copyright',
    legal = 'commonwebroot-main.loader.legal',
    mainScreen = 'commonwebroot-main.component.mainScreen',
    screen = 'commonwebroot-main.component.screen'
}

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'layout-compiler',
    styleUrls: ['./layout-compiler.component.scss'],
    templateUrl: './layout-compiler.component.html',
    animations: [
        trigger('fade', [
            transition(':enter', [
                style({ opacity: '1' }),
                animate(300)
            ]),
            transition(':leave', [
                animate(300, style({ opacity: '0' }))
            ]),
            state('*', style({ opacity: '1' }))
        ])
    ]
})
export class LayoutCompilerComponent implements OnInit, AfterViewInit, OnDestroy {

    /** List of screens to display */
    screens: LayoutAdapter.Screen$v1[];

    /** The screen id that was passed it. Also means this is a child screen */
    selectedScreenId: string;

    /** When true the compiler is in preview mode */
    isPreview = false;

    /** When true the selected workspace has been loaded */
    loaded = false;

    /** When true the extra screen have been blocked by the popup blocker */
    screensBlocked = false;

    /** If of the workspace that is currently selected */
    selectedWorkspaceId: string;

    /** Expose tokens to HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** The current user */
    user: UserInfo$v1;

    /** The capability id for common layout manager */
    layoutManagerCapabilityId = capabilityId;

    /** Expose common layout manager UI claims to the UI */
    layoutManagerClaims: typeof Claims = Claims;

    /** Stream of custom tabs */
    customTabs$ = from(this.layoutCompiler.getCustomTabsAsync()).pipe(
        mergeMap(data => data)
    );

    /** Stream of custom overlays */
    customOverlays$ = from(this.layoutCompiler.getCustomOverlaysAsync()).pipe(
        mergeMap(data => data)
    );

    /** The physical workspace that is default for the current user */
    defaultPhysicalWorkspace: PhysicalWorkspace$v1;

    /** Determines if localization initialization has finished before setting the title. */
    private localizationInitialized$ = new BehaviorSubject<boolean>(false);

    private readonly productTitle = 'HxGN Connect';

    private routeWorkspaceId;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    /**
     * Is fired before the app shuts down
     * @param $event Event object
     */
    @HostListener('window:beforeunload', ['$event'])
    killAllScreens($event: any) {
        this.windowCommSrv.destroyAll();
    }

    constructor(private layoutCompiler: LayoutAdapter.LayoutCompilerAdapterService,
        private layoutCore: LayoutCore.LayoutCompilerCoreDataService,
        private windowCommSrv: CommonWindowCommunicationService,
        private route: ActivatedRoute,
        private router: Router,
        private identitySrv: CommonidentityAdapterService$v1,
        private layoutSrv: LayoutCompilerService,
        private mainMenuService: NavigationService,
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private dialog: MatDialog,
        private titleSrv: Title,
        private hubManager: CommonHubManagerService) {

        // Listen to hub manager's request to load capability core
        this.hubManager.pendingHubs$.subscribe(ids => {
            for (const id of ids) {
                this.hubManager.initHub(id, true);
                this.layoutCompiler.loadCapabilityCoreAsync(id);
            }
        });
    }

    /**
     * Components on init life cycle event
     */
    async ngOnInit() {
        this.initLocalization();
        this.user = await this.identitySrv.getUserInfoAsync();
        this.selectedScreenId = this.route.snapshot.queryParamMap.get('screen');
        this.routeWorkspaceId = this.route.snapshot.queryParamMap.get('workspace');
        this.isPreview = this.route.snapshot.queryParamMap.get('ispreview') === 'true';

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalization();
            this.setTitle();
        });
    }

    /**
     * Component's after view init life cycle event
     */
    async ngAfterViewInit() {
        // If preview get the manifest from sessionStorage
        if (this.isPreview) {
            const workspaceManifest: LayoutAdapter.WorkspaceManifest$v1 =
                JSON.parse(sessionStorage.getItem('workspaceManifestPreview'));
            if (workspaceManifest) {
                await this.layoutCompiler.setWorkspaceManifestAsync(workspaceManifest);
                this.screens = workspaceManifest.workspaces.find(w => w.id === this.routeWorkspaceId).screens;
                this.loaded = true;
                return;
            }
        } else {
            this.layoutSrv.workspaceChange$.subscribe(async (workspaceId) => {
                this.loaded = false;
                if (!workspaceId) {

                    const defaultWorkspaceManifest = await this.layoutCore.getGroupedWorkspaceManifest$(true).toPromise();
                    this.defaultPhysicalWorkspace = defaultWorkspaceManifest.physicalWorkspaces[0];

                    await this.layoutCompiler.setWorkspaceManifestAsync(defaultWorkspaceManifest);
                    workspaceId = this.defaultPhysicalWorkspace.defaultWorkspacePresetId;

                    this.selectedWorkspaceId = workspaceId;
                    this.screens = defaultWorkspaceManifest.workspaces[0].screens;

                } else {
                    const workspaceManifest = await this.layoutCompiler.getWorkspaceManifestAsync(workspaceId);
                    if (workspaceManifest) {
                        await this.layoutCompiler.setWorkspaceManifestAsync(workspaceManifest);
                        this.screens = workspaceManifest.workspaces[0].screens;
                        this.selectedWorkspaceId = workspaceManifest.workspaces[0].id;
                    } else {
                        // The selected workspace is missing go back to the default
                        const defaultWorkspaceManifest = await this.layoutCore.getWorkspaceManifest$(true).toPromise();
                        const wId = defaultWorkspaceManifest.physicalWorkspaces[0].defaultWorkspacePresetId;

                        this.layoutSrv.workspaceChange$.next(wId);
                        this.selectedWorkspaceId = wId;
                    }
                }

                // Bootstrap the linked view system
                await this.layoutCompiler.setActiveLinkedViewWorkspaceAsync(this.selectedWorkspaceId);

                if (!this.windowCommSrv.isChildWindow()) {
                    // Close all windows that is not admin and help
                    const handleIds = this.windowCommSrv.getHandleIds();
                    if (handleIds.length) {
                        handleIds.forEach((id) => {
                            if (id !== 'admin' && id !== 'user-help') {
                                this.windowCommSrv.destroyHandle(id);
                            }
                        });
                    }
                    this.setUpLogOffEvent();
                    this.setUpOpenAdminEvent();
                    this.setUpReloadEvent();
                    this.setUpAdminHelpEvent();
                    this.setUpAdminProvisionerHelpEvent();
                    this.setUpUserHelpEvent();
                    this.setUpOpenUserProfileEvent();

                    if (!this.selectedScreenId && this.layoutSrv.openWorkspaceScreens) {
                        // If more then one screen create child windows
                        if (this.screens.length > 1 && !this.isPreview) {
                            // Set title to be main
                            this.setTitle(this.tokens.mainScreen);

                            const port = window.location.port;
                            let screenUrl = '/screen';

                            if (port !== '4200') {
                                screenUrl = '/webroot/screen';
                            }


                            for (let i = 1; i < this.screens.length; i++) {
                                const screen = this.screens[i];
                                // Check to see screen is already open before opening it
                                if (!this.windowCommSrv.hasHandle(screen.id)) {
                                    const windowHandle = window.open(`${screenUrl}?workspace=${workspaceId}&screen=${screen.id}`);
                                    if (windowHandle) {
                                        // Create the screens
                                        this.windowCommSrv.createHandle(screen.id, windowHandle);
                                    } else {
                                        this.screensBlocked = true;
                                        this.windowCommSrv.destroyAll(); // Close any screens that made it through the popup blocker
                                        setTimeout(() => {
                                            this.screensBlocked = false;
                                        }, 10000);
                                        break;
                                    }
                                }
                            }
                        } else {
                            this.setTitle();
                        }
                    }
                } else {
                    const index = this.screens.findIndex(item => item.id === this.selectedScreenId);
                    this.setTitle(this.tokens.screen, index + 1);
                }

                this.loaded = true;
            });
        }
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /**
     * Returns the screens that needs to be shown
     */
    getMasterScreen(): LayoutAdapter.Screen$v1 {
        if (this.screens && !this.selectedScreenId) {
            return this.screens[0];
        } else if (this.screens && this.selectedScreenId) {
            const index = this.screens.findIndex(item => item.id === this.selectedScreenId);
            return this.screens[index];
        } else {
            return null;
        }
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

            if (!this.windowCommSrv.hasHandle('admin')) {
                this.windowCommSrv.createHandle('admin',
                    window.open(`${screenUrl}`));
            } else {
                this.windowCommSrv.setFocus('admin');
            }

            this.mainMenuService.closeMainMenu();
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

            if (!this.windowCommSrv.hasHandle('userprofile')) {
                this.windowCommSrv.createHandle('userprofile',
                    window.open(`${screenUrl}`));
            } else {
                this.windowCommSrv.setFocus('userprofile');
            }

            this.mainMenuService.closeMainMenu();
        }
    }

    /**
     * Sets up a listener for the open user profile event
     */
    private setUpOpenUserProfileEvent() {
        this.windowCommSrv.receiveMessage$
            .pipe(filter(msg => msg.contextId === 'OPEN_USER_PROFILE'))
            .subscribe(() => {
                this.navToUserProfile();
            });
    }

    /**
     * Sets up a listener for the log off event from child windows
     */
    private setUpLogOffEvent() {
        this.windowCommSrv.receiveMessage$
            .pipe(filter(msg => msg.contextId === 'MAIN_LOGOFF'))
            .subscribe(() => {
                this.windowCommSrv.destroyAll();
                this.identitySrv.logoff();
            });
    }


    /**
     * Sets up a listener for the log off event from child windows
     */
    private setUpOpenAdminEvent() {
        this.windowCommSrv.receiveMessage$
            .pipe(filter(msg => msg.contextId === 'OPEN_ADMIN'))
            .subscribe(() => {
                this.navToAdminView();
            });
    }

    /**
     * Sets up a listener for opening the admin help page from child windows
     */
    private setUpAdminHelpEvent() {
        this.windowCommSrv.receiveMessage$
            .pipe(filter(msg => msg.contextId === 'ADMIN_HELP'))
            .subscribe(() => {
                this.handleAdminHelp();
            });
    }

    /**
     * Sets up a listener for opening the admin help page from child windows
     */
    private setUpAdminProvisionerHelpEvent(): void {
        this.windowCommSrv.receiveMessage$
            .pipe(filter(msg => msg.contextId === 'ADMIN_HELP_PROVISIONER'))
            .subscribe(() => {
                this.handleProvisionerAdminHelp();
            });
    }

    /**
     * Sets up a listener for opening the user help page from child windows
     */
    private setUpUserHelpEvent() {
        this.windowCommSrv.receiveMessage$
            .pipe(filter(msg => msg.contextId === 'USER_HELP'))
            .subscribe(() => {
                this.handleUserHelp();
            });
    }

    /**
     * Sets up a listener for the log off event from child windows
     */
    private setUpReloadEvent() {
        this.windowCommSrv.receiveMessage$
            .pipe(filter(msg => msg.contextId === 'RELOAD_PAGE'))
            .subscribe(() => {
                const hostname = window.location.hostname;

                if (hostname !== 'localhost') {
                    window.location.href = '/webroot';
                } else {
                    window.location.href = '/';
                }
            });
    }

    /** Set up routine for localization. */
    private initLocalization() {
        const tokens: string[] = Object.keys(TranslationTokens).map(k => TranslationTokens[k]);
        this.localizationSrv.getTranslationAsync(tokens).then(() => {
            this.localizationInitialized$.next(true);
        });
    }

    /** Help handler for opening admin help window. */
    handleAdminHelp() {
        const hostname = window.location.hostname;
        const screenUrl = hostname !== 'localhost' ? '/webroot/help/admin' : '/help/admin';
        const handle = 'admin-help';

        if (this.windowCommSrv.hasHandle(handle)) {
            this.windowCommSrv.setFocus(handle);
        } else {
            this.windowCommSrv.createHandle(handle,
                window.open(`${screenUrl}`));
        }
    }

    /** Help handler for opening admin help window. */
    handleProvisionerAdminHelp(): void {
        const hostname = window.location.hostname;
        const screenUrl = hostname !== 'localhost' ? '/webroot/help/provisioner' : '/help/provisioner';
        const handle = 'admin-help-provisioner';

        if (this.windowCommSrv.hasHandle(handle)) {
            this.windowCommSrv.setFocus(handle);
        } else {
            this.windowCommSrv.createHandle(handle,
                window.open(`${screenUrl}`));
        }
    }

    /** Help handler for opening user help window. */
    handleUserHelp() {
        const port = window.location.port;
        const screenUrl = port !== '4200' ? '/webroot/help' : '/help';
        const handle = 'user-help';

        if (this.windowCommSrv.hasHandle(handle)) {
            this.windowCommSrv.setFocus(handle);
        } else {
            this.windowCommSrv.createHandle(handle,
                window.open(`${screenUrl}`));
        }
    }

    /** Opens help window. */
    openHelp() {
        if (this.windowCommSrv.isChildWindow()) {
            this.windowCommSrv.messageMaster({
                contextId: 'USER_HELP',
                handleId: null,
                data: null
            });
        } else {
            this.handleUserHelp();
        }
    }

    /** Opens about dialog. */
    openAboutDialog() {
        this.dialog.open(AboutDialogComponent, {
            width: '1042px',
            panelClass: 'dialog-reset',
            autoFocus: false
        });
    }

    private setTitle(token?: string, rest?: any) {
        this.localizationInitialized$.pipe(
            filter(isReady => isReady),
            first()
        ).subscribe(async () => {
            if (token) {
                const title = await this.localizationSrv.getTranslationAsync(token);

                if (rest) {
                    this.titleSrv.setTitle(`${this.productTitle} - ${title} ${rest}`);
                } else {
                    this.titleSrv.setTitle(`${this.productTitle} - ${title}`);
                }
            } else {
                this.titleSrv.setTitle(this.productTitle);
            }
        });
    }
}
