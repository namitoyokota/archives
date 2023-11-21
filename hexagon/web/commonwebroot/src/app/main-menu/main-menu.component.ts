import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UserInfo$v1 } from '@galileo/web_commonidentity/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';

import { MainMenuTranslatedTokens, MainMenuTranslationTokens } from './main-menu.translation';
import { NavigationService } from './navigation.service';


@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'hxgn-main-menu-section-content',
    styles: [],
    template: `<ng-content></ng-content>`
})
export class CommonMainMenuSectionContentComponent { }

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'hxgn-main-menu-section',
    styles: [
        `.section-header {
            height: 26px;
            display: flex;
            align-items: center;
            background-color: #1b1b1c;
            color: #d2d4d5;
            font-size: 13px;
            line-height: 16px;
            margin-bottom: 3px;
            padding-left: 15px;
            text-transform: uppercase;
        }`
    ],
    template: `
        <div class="section-header" *ngIf="!hideSectionHeader">
            <ng-content></ng-content>
        </div>
        <ng-content select="hxgn-main-menu-section-content"></ng-content>
        <ng-content select="hxgn-main-menu-item"></ng-content>
    `
})
export class CommonMainMenuSectionComponent {

    /** Whether or not to hide the section header. */
    @Input() hideSectionHeader = false;
}

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'hxgn-main-menu',
    templateUrl: 'main-menu.component.html',
    styleUrls: ['main-menu.component.scss'],
    animations: [
        trigger('slideRight', [
            state('out', style({ width: '*' })),
            state('in', style({ width: '0' })),
            state('void', style({ width: '0' })),
            transition('* <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
        ])
    ]
})
export class CommonMainMenuComponent implements OnInit {

    /** Current user object */
    @Input() user: UserInfo$v1;

    /** Changes the slideout menu name depending on if it is an admin menu. */
    @Input() isAdminMenu = false;

    /** Emits an event upon the user logging out */
    @Output() logOut = new EventEmitter();

    /** Expose tokens to HTML */
    tokens: typeof MainMenuTranslationTokens = MainMenuTranslationTokens;

    /** Translated tokens */
    tTokens: MainMenuTranslatedTokens = {} as MainMenuTranslatedTokens;

    constructor(
        public navigationSrv: NavigationService,
        private localizationAdapter: CommonlocalizationAdapterService$v1
    ) {}

    /** OnInit */
    async ngOnInit() {
        this.initLocalization();
    }

    /**
     * Triggers an event when the menu expanding/collapsing animation is complete
     * @param $event Contains data related to the main menu
     */
    animationDone($event: any): void {
        if (!this.navigationSrv.RouteChanging) {
            this.navigationSrv.onMainMenuToggled.next();
        }

        // Dispatch window resize event
        setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 100);
    }

    /**
     * Emits an event when the user logs out
     */
    onLogOut() {
        this.logOut.emit();
    }

    /**
     * Set up routine for localization
     */
    private async initLocalization() {
        const tokens: string[] = Object.keys(MainMenuTranslationTokens).map(k => MainMenuTranslationTokens[k]);
        const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);
        this.tTokens.hexagonLogo = translatedTokens[MainMenuTranslationTokens.hexagonLogo];
        this.tTokens.hxgnConnect = translatedTokens[MainMenuTranslationTokens.hxgnConnect];
        this.tTokens.hxgnConnectAdmin = translatedTokens[MainMenuTranslationTokens.hxgnConnectAdmin];
    }
}
