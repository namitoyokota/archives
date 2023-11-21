import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment.prod';

export enum TranslationTokens {
    userProfile = 'commonwebroot-main.component.userProfile'
}

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html'
})
export class UserProfileComponent implements OnInit, OnDestroy {

    /** Build number used for link to privacy policy pdf. */
    buildNumber = environment.buildNumber;

    /** Expose translation tokens to html template */
    tokens: typeof TranslationTokens = TranslationTokens;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(private localizationSrv: CommonlocalizationAdapterService$v1,
        private titleSrv: Title) { }

    /** On init */
    ngOnInit() {
        this.setTitle();

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.setTitle();
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /** Sets the page's title */
    private async setTitle() {
        this.titleSrv.setTitle('HxGN Connect');
        const title = await this.localizationSrv.getTranslationAsync(this.tokens.userProfile);
        this.titleSrv.setTitle(`HxGN Connect - ${title}`);
    }
}
