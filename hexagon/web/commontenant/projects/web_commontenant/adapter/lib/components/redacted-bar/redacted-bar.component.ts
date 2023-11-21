import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { TranslationGroup } from '@galileo/web_commontenant/_common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TranslationTokens } from './redacted-bar.translation';

@Component({
    selector: 'hxgn-commontenant-redacted-bar',
    templateUrl: 'redacted-bar.component.html',
    styleUrls: ['redacted-bar.component.scss']
})
export class RedactedBarComponent implements OnInit, OnDestroy {

    /** List of translation tokens to display as redacted properties. */
    @Input() translationTokens: string[] = [];

    /** Expose translation tokens to html. */
    tokens: typeof TranslationTokens = TranslationTokens;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(private localizationSrv: CommonlocalizationAdapterService$v1) { }

    /** On init life cycle hook */
    ngOnInit(): void {
        this.localizationSrv.localizeGroup(TranslationGroup.main);

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.localizationSrv.localizeGroup(TranslationGroup.main);
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }
}
