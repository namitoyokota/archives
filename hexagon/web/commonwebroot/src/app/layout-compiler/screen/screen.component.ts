import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonWindowCommunicationService } from '@galileo/web_common-http';
import { NavigationService } from '../../main-menu/navigation.service';
import { UserInfo$v1 } from '@galileo/web_commonidentity/adapter';
import {
    Context$v1,
    CustomTab$v1,
    Layout$v1,
    LayoutCompilerAdapterService,
    Screen$v1,
    SlideOutMenuOption$v1,
    Tab$v1,
    CustomOverlay$v1
} from '@galileo/web_commonlayoutmanager/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from 'src/app/notification.service';

import { AboutDialogComponent } from '../../about-dialog/about-dialog.component';
import { ScreenTranslatedTokens, ScreenTranslationTokens } from './screen.translation';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'hxgn-layout-compiler-screen',
    templateUrl: './screen.component.html',
    styleUrls: ['./screen.component.scss']
})
export class ScreenComponent implements OnInit, OnDestroy {

    /** Screen data object */
    @Input() screen: Screen$v1;

    /** Id of selected tab */
    @Input() selectedTabId: string;

    /** The id of the selected workspace */
    @Input() workspaceId: string;

    /** List of custom tabs created by a capability at runtime */
    @Input() customTabs: CustomTab$v1[] = [];

    /** List of custom overlays created by a capability at runtime */
    @Input() customOverlays: CustomOverlay$v1[] = [];

    /** Current user */
    @Input() user: UserInfo$v1;

    /** Tabs that have been loaded into the dom */
    selectedViewTabs: Tab$v1[];

    /** The currently selected tab */
    selectedViewTab: Tab$v1;

    /** List of tabs for the screen */
    tabList: Tab$v1[] = [];

    /** Expose tokens to HTML */
    tokens: typeof ScreenTranslationTokens = ScreenTranslationTokens;

    /** When true a deprecation banner is shown */
    showDeprecationBanner = false;

    /** When true a expiration banner is shown */
    showExpirationBanner = false;

    /** Index of the tab that is currently selected */
    selectedTabIndex = 0;

    /** A flag that is true if it is the main window */
    isMainWindow = false;

    /** Destroy subject */
    private destroy$: Subject<void> = new Subject<void>();

    /** The selected custom tab id */
    selectedCustomTabId: string;

    /** Translated tokens */
    tTokens: ScreenTranslatedTokens = {} as ScreenTranslatedTokens;

    constructor(
        private layoutCompiler: LayoutCompilerAdapterService,
        private mainMenuService: NavigationService,
        private windowCommSrv: CommonWindowCommunicationService,
        private dialog: MatDialog,
        private notificationSrv: NotificationService,
        private localizationSrv: CommonlocalizationAdapterService$v1
    ) { }

    /**
     * On init life cycle hook
     */
    async ngOnInit() {
        this.initLocalization();
        this.isMainWindow = !this.windowCommSrv.isChildWindow();

        /** List to artifact updates */
        this.notificationSrv.artifactUpdate$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(isExpired => {
            if (isExpired) {
                this.displayExpirationBanner();
            } else {
                this.displayDeprecationBanner();
            }
        });

        if (this.screen) {
            // Get default Layout
            const layout: Layout$v1 = await this.layoutCompiler.getLayoutAsync(this.screen.defaultLayout);

            for (const tabId of layout.tabIds) {
                this.tabList.push(await this.layoutCompiler.getTabAsync(tabId));
            }

            // Get default Tab
            this.layoutCompiler.setActiveTabAsync(layout.defaultTab);

            // Store that default selected tab
            this.selectedViewTabs = [];
            this.selectedViewTabs.push(this.selectedViewTab);
        }

        // Listen to change tabs
        const activeTabId$: Observable<string> = await this.layoutCompiler.getActiveTabIdAsync();
        activeTabId$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(id => {
            // Set the active tab.
            const foundViewTab = this.tabList.find(item => item.id === id);
            if (foundViewTab) {
                this.selectedViewTab = foundViewTab;
            } else {
                // If no view tab is found then this must be a custom tab
                this.selectedCustomTabId = id;
            }

            this.selectedTabIndex = this.getSelectedTabIndex();
        });

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalization();
        });
    }

    /**
     * On destroy life cycle hook
     */
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Sets the active tab by index
     * @param index Index of the selected tab
     */
    async setSelectedTab(index: number) {
        // If the tab is a layout manager tab
        if (index < this.tabList.length) {
            this.selectedCustomTabId = null;
            const selectedTab = this.tabList[index];
            this.layoutCompiler.setActiveTabAsync(selectedTab?.id);
            const result = this.selectedViewTabs.find((tab) => tab?.id === selectedTab?.id);
            if (!result) {
                this.selectedViewTabs.push(selectedTab);
            }
        } else {
            this.selectedCustomTabId = this.customTabs[index - this.tabList.length].id;
            this.layoutCompiler.setActiveTabAsync(this.selectedCustomTabId);
            this.selectedViewTab = null;
        }

        // Event that the window resize
        this.fireWindowResize();
    }

    /**
     * Returns the index of the tab that is currently selected
     */
    getSelectedTabIndex(): number {
        if (!this.selectedCustomTabId) {
            return this.tabList.findIndex(item => item?.id === this.selectedViewTab?.id);
        } else {
            return this.customTabs?.findIndex(tab => tab?.id === this.selectedCustomTabId) + this.tabList?.length;
        }
    }

    /** Show the slideout menu */
    showSlideOutMenu(): boolean {
        return this.screen.slideOutMenuOption !== SlideOutMenuOption$v1.DoNotShow;
    }

    /** Toggle the main menu */
    toggleMainMenu() {
        this.mainMenuService.toggleMainMenu();
    }

    /** Show the deprecation banner */
    displayDeprecationBanner(): void {
        this.showExpirationBanner = false;
        this.showDeprecationBanner = true;
    }

    /** Show the close menu icon */
    showCloseMenuIcon(): boolean {
        return this.mainMenuService.mainMenuState !== 'in';
    }

    /** Return the elements id if it exists */
    trackElement(index: number, element: any) {
        return element ? element.id : null;
    }

    /**
     * Returns the context id for the current tab
     */
    getCurrentContextId(): string {
        return new Context$v1({
            workspaceId: this.workspaceId
        } as Context$v1).id();
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
            const port = window.location.port;
            let screenUrl = '/help';
            const handle = 'user-help';

            if (port !== '4200') {
                screenUrl = '/webroot/help';
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
            autoFocus: false
        });
    }

    /** Dismiss the depreciation banner */
    dismissDeprecationBanner(): void {
        this.showDeprecationBanner = false;
    }

    /** Display the expiration banner */
    private displayExpirationBanner(): void {
        this.showDeprecationBanner = false;
        this.showExpirationBanner = true;
    }

    /** Reload the page */
    reloadPage(): void {
        window.location.reload();
    }

    /** Resize the window */
    private fireWindowResize() {
        setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 100);
    }

    /** Set up routine for localization */
    private async initLocalization(): Promise<void> {
        const tokens: string[] = Object.keys(ScreenTranslationTokens).map(k => ScreenTranslationTokens[k]);
        const translatedTokens = await this.localizationSrv.getTranslationAsync(tokens);
        this.tTokens.about = translatedTokens[ScreenTranslationTokens.about];
        this.tTokens.help = translatedTokens[ScreenTranslationTokens.help];
    }
}
