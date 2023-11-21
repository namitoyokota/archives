import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { KeywordNode$v1 } from '@galileo/web_commonkeywords/_common';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TranslatedTokens, TranslationTokens } from './display-name.translation';

@Component({
    selector: 'hxgn-commonkeywords-display-name',
    templateUrl: 'display-name.component.html',
    styleUrls: ['display-name.component.scss']
})

export class DisplayNameComponent implements OnInit, OnDestroy {

    /** The keyword node editing */
    @Input() keywordNode: KeywordNode$v1;

    /** Event when an change to the keyword node has been made */
    @Output() updated = new EventEmitter<KeywordNode$v1>();

    /** Is also a keyword when true */
    isKeyword = true;

    /** Expose TranslationTokens to the HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Translated tokens */
    tTokens: TranslatedTokens = {} as TranslatedTokens;

    private oldFriendlyVal: string;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(private localizationAdapter: CommonlocalizationAdapterService$v1) { }

    ngOnInit() {
        this.initLocalization();

        this.isKeyword = !!this.keywordNode.keywords.find(keyword => {
            return keyword === this.keywordNode.friendlyName;
        });

        if (!this.keywordNode.friendlyName) {
            this.isKeyword = true;
        }

        this.oldFriendlyVal = this.keywordNode.friendlyName;

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

    /**
     * Returns true if friendly name is also a keyword
     */
    isFriendlyNameKeyword(): boolean {
        return !!this.keywordNode.keywords.find(word => word === this.keywordNode.friendlyName);
    }

    /**
     * Event that is fired when the friendly name changes
     */
    onFriendlyNameChange() {
        if (this.isKeyword) {
            const newVal = this.keywordNode.friendlyName.toLocaleLowerCase().trim();
            // Keep keywords in sync
            const index = this.keywordNode.keywords.findIndex(keyword => keyword === this.oldFriendlyVal);
            if (index > -1) {
                if (newVal) {
                    this.keywordNode.keywords[index] = newVal;
                } else {
                    this.keywordNode.keywords.splice(index, 1);
                }
            } else {
                this.keywordNode.keywords.push(newVal);
            }

            this.oldFriendlyVal = newVal;
        }

        this.updated.emit(this.keywordNode);
    }

    /**
     * Adds or removes friendly name for list of keywords
     * based on value of checkbox
     */
    addToKeywordsChange(event: MatCheckboxChange) {
        this.isKeyword = event.checked;

        // If friendly name is null then done process
        if (!this.keywordNode.friendlyName || !this.keywordNode.friendlyName.trim()) {
            return;
        }

        if (event.checked) {
            const newVal = this.keywordNode.friendlyName.toLocaleLowerCase().trim();

            // Make sure the keyword is not already part of the rule
            const isValid = !this.keywordNode.keywords.find(k => k === newVal);
            if (isValid) {
                this.keywordNode.keywords.push(newVal);
            }

            this.oldFriendlyVal = newVal;
        } else {
            const newVal = this.keywordNode.friendlyName.toLocaleLowerCase().trim();
            // Keep keywords in sync
            const index = this.keywordNode.keywords.findIndex(keyword => keyword === newVal);
            if (index > -1) {
                this.keywordNode.keywords.splice(index, 1);
            }
        }

        this.updated.emit(this.keywordNode);
    }

    /**
     * Returns false if the friendly name is not valid
     */
    validateFriendlyName(): boolean {
        if (!this.keywordNode.friendlyName || !this.keywordNode.friendlyName.trim()) {
            return false;
        }

        return undefined;
    }

    /** Set up routine for localization. */
    private async initLocalization() {
        const tokens: string[] = Object.keys(TranslationTokens).map(k => TranslationTokens[k]);

        const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);
        this.tTokens.displayName = translatedTokens[TranslationTokens.displayName];
    }
}
