import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AboutDialogComponent } from '../about-dialog/about-dialog.component';
import { CommonWindowCommunicationService } from '@galileo/web_common-http';
import { CommonidentityAdapterService$v1, UserInfo$v1 } from '@galileo/web_commonidentity/adapter';

import {
    Claims as LayoutManagerClaims,
    capabilityId as LayoutManagerCapabilityId
} from '@galileo/web_commonlayoutmanager/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { AppBarTranslatedTokens, AppBarTranslationTokens } from './app-bar.translation';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-bar',
    templateUrl: 'app-bar.component.html',
    styleUrls: ['app-bar.component.scss']
})
export class AppBarComponent implements OnInit, OnDestroy {

    /** Title for bar. Optional. Defaults to HxGN Connect image if not provided. */
    @Input() title: string;

    /** Boolean to determine whether or not to show the user help button. */
    @Input() showUserHelp = false;

    /** Current user. */
    user: UserInfo$v1;

    /** Expose common layout manager claims to HTML */
    layoutManagerClaims: typeof LayoutManagerClaims = LayoutManagerClaims;

    /** Translated tokens */
    tTokens: AppBarTranslatedTokens = {} as AppBarTranslatedTokens;

    /** Capability id for layout manager */
    readonly layoutManagerCapabilityId = LayoutManagerCapabilityId;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private dialog: MatDialog,
        private identitySrv: CommonidentityAdapterService$v1,
        private windowCommSrv: CommonWindowCommunicationService,
        private localizationSrv: CommonlocalizationAdapterService$v1
    ) { }

    /** Asynchronously run on component initialization. */
    async ngOnInit() {
        this.initLocalization();
        this.user = await this.identitySrv.getUserInfoAsync();

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
     * Open the about dialog
     */
    openAboutDialog(): void {
        this.dialog.open(AboutDialogComponent, {
            width: '1042px',
            panelClass: 'dialog-reset',
            autoFocus: false
        });
    }

    /** Opens help window. */
    openUserHelp() {
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

    /** Set up routine for localization */
    private async initLocalization(): Promise<void> {
        const tokens: string[] = Object.keys(AppBarTranslationTokens).map(k => AppBarTranslationTokens[k]);
        const translatedTokens = await this.localizationSrv.getTranslationAsync(tokens);

        this.tTokens.about = translatedTokens[AppBarTranslationTokens.about];
        this.tTokens.help = translatedTokens[AppBarTranslationTokens.help];
    }
}
