import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Keycodes$v1 } from '@galileo/web_common-libraries';
import { KeywordRule$v1 } from '@galileo/web_commonkeywords/_common';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { RuleDetailsTranslatedTokens, RuleDetailsTranslationTokens } from './rule-details.translation';

@Component({
    selector: 'hxgn-commonkeywords-rule-details',
    templateUrl: 'rule-details.component.html',
    styleUrls: ['rule-details.component.scss']
})
export class RuleDetailsComponent implements OnInit, OnDestroy {

    /** The starting keyword rule */
    @Input() rule: KeywordRule$v1;

    /** Event when the list of keywords have changed */
    @Output() ruleChange = new EventEmitter<KeywordRule$v1>();

    /** Expose RuleDetailsTranslationTokens to HTML */
    tokens: typeof RuleDetailsTranslationTokens = RuleDetailsTranslationTokens;

    /** Translated tokens */
    tTokens: RuleDetailsTranslatedTokens = {} as RuleDetailsTranslatedTokens;

    /** Rule that has been edited */
    editRule: KeywordRule$v1;

    /** Use space and comma as split keywords */
    readonly keycodes = [Keycodes$v1.comma];

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(private localizationAdapter: CommonlocalizationAdapterService$v1) { }

    /** On init life cycle hook */
    ngOnInit() {
        this.initLocalization();
        this.editRule = new KeywordRule$v1(this.rule);

        this.localizationAdapter.adapterEvents.languageChanged$.pipe(
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

    /** Add string to keyword list */
    addKeyword(keyword: string) {
        this.editRule.keywords = [...this.editRule.keywords, keyword];
        this.ruleChange.emit(this.editRule);
    }

    /** Remove string from keyword list */
    removeKeyword(keyword: string) {
        this.editRule.keywords = this.editRule.keywords.filter(k => k !== keyword);
        this.ruleChange.emit(this.editRule);
    }

    /** Validates that name is valid */
    isInvalid(): boolean {
        const isValid = !!this.rule?.friendlyName?.trim();
        if (isValid) {
            return undefined;
        }
        return isValid;
    }

    /** Set up routine for localization. */
    private async initLocalization() {
        const tokens: string[] = Object.keys(RuleDetailsTranslationTokens).map(k => RuleDetailsTranslationTokens[k]);

        const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);
        this.tTokens.entryName = translatedTokens[RuleDetailsTranslationTokens.entryName];
        this.tTokens.enterKeywords = translatedTokens[RuleDetailsTranslationTokens.enterKeywords];
    }
}
