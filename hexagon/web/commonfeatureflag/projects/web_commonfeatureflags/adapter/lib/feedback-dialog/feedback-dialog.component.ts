import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Person$v1 } from '@galileo/web_common-libraries';
import { AddFeedbackMessage$v1, FeatureFlag$v2, TranslationGroup } from '@galileo/web_commonfeatureflags/_common';
import { CommonidentityAdapterService$v1, UserInfo$v1 } from '@galileo/web_commonidentity/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CommonfeatureflagsAdapterService$v1 } from '../adapter.v1.service';
import { FeedbackDialogTranslatedTokens, FeedbackDialogTranslationTokens } from './feedback-dialog.translation';

@Component({
    templateUrl: 'feedback-dialog.component.html',
    styleUrls: ['feedback-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackDialogComponent implements OnInit, OnDestroy {

    /** Tracks person for contact purposes. */
    private contact: Person$v1 = null;

    /** Feedback message object. */
    feedbackMessage: AddFeedbackMessage$v1 = new AddFeedbackMessage$v1();

    /** Expose translation tokens to html. */
    readonly tokens: typeof FeedbackDialogTranslationTokens = FeedbackDialogTranslationTokens;

    /** List of translated tokens. */
    readonly tTokens: FeedbackDialogTranslatedTokens = {} as FeedbackDialogTranslatedTokens;

    /** Sets privacy policy pdf URL. */
    url: SafeResourceUrl;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        @Inject(MAT_DIALOG_DATA) public featureFlags: FeatureFlag$v2[],
        private adapterSrv: CommonfeatureflagsAdapterService$v1,
        private dialogRef: MatDialogRef<FeedbackDialogComponent>,
        private identitySrv: CommonidentityAdapterService$v1,
        private localizationSrv: CommonlocalizationAdapterService$v1
    ) { }

    /**
     * On init life cycle hook.
     */
    ngOnInit(): void {
        this.initTTokensAsync();
        this.featureFlags = this.featureFlags.sort((a: FeatureFlag$v2, b: FeatureFlag$v2) =>
            a.friendlyName.localeCompare(b.friendlyName)
        );
        this.feedbackMessage.category = this.featureFlags.map(x => x.flagId);

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            if (lang && lang !== '') {
                this.initTTokensAsync();
            }
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /**
     * Closes dialog.
     */
    close(): void {
        this.dialogRef.close(false);
    }

    /**
     * Saves message if one exists and closes dialog.
     */
    async disableAsync(): Promise<void> {
        if (this.feedbackMessage.message) {
            await this.adapterSrv.saveFeedbackMessageAsync(this.feedbackMessage);
        }

        this.dialogRef.close(true);
    }

    /**
     * Toggles contact value for feedback
     */
    async toggleContactAsync(): Promise<void> {
        if (!this.contact) {
            const userInfo: UserInfo$v1 = await this.identitySrv.getUserInfoAsync();

            this.contact = new Person$v1({
                firstName: userInfo.givenName,
                lastName: userInfo.familyName,
                title: userInfo.title,
                email: userInfo.email,
                phone: userInfo.phone
            });
        }

        if (this.feedbackMessage.contactInfo) {
            this.feedbackMessage.contactInfo = null;
        } else {
            this.feedbackMessage.contactInfo = this.contact;
        }
    }

    /**
     * Builds link to privacy policy pdf.
     */
    // private buildLink(): void {
    //     let host = '/';
    //     const port = window.location.port;
    //     if (port !== '4200') {
    //         host = '/webroot/';
    //     }

    //     this.url = `${host}${this.buildNumber}/help/HxGN_Connect_Privacy_Notice.pdf`;
    // }

    /**
     * Stores tTokens
     */
    private async initTTokensAsync(): Promise<void> {
        this.localizationSrv.localizeGroup(TranslationGroup.main);

        this.tTokens.enterAnyCommentsHere = '';

        const tokens: string[] = Object.values(FeedbackDialogTranslationTokens);
        const translatedTokens = await this.localizationSrv.getTranslationAsync(tokens);

        this.tTokens.enterAnyCommentsHere = translatedTokens[FeedbackDialogTranslationTokens.enterAnyCommentsHere];
    }
}
