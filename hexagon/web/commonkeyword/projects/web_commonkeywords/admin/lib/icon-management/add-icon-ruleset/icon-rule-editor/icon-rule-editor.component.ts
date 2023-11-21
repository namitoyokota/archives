import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { KeywordNode$v1 } from '@galileo/web_commonkeywords/_common';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SimilarMatch } from '../similar-matches/similar-matches.component';
import { TranslatedTokens, TranslationTokens } from './icon-rule-editor.translation';

@Component({
    selector: 'hxgn-commonkeywords-icon-rule-editor',
    templateUrl: 'icon-rule-editor.component.html',
    styleUrls: ['icon-rule-editor.component.scss']
})

export class IconRuleEditorComponent implements OnInit, OnDestroy {

    /** The node to display data about */
    @Input() node: KeywordNode$v1;

    /** The index of the nod in the node list */
    @Input() nodeIndex: number;

    /** List of nodes to use for doing similar keyword check */
    @Input() readonly nodes: KeywordNode$v1[];

    /** Events when a change to a node has been made */
    @Output() nodeChange = new EventEmitter<KeywordNode$v1>();

    /** Hods the keyword value as it is inputted */
    keywordInput: string;

    /** Expose TranslationTokens to the HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Translated tokens */
    tTokens: TranslatedTokens = {} as TranslatedTokens;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(private localizationAdapter: CommonlocalizationAdapterService$v1) { }

    ngOnInit() {
        this.initLocalization();

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
     * Adds keyword to node.
     */
    addKeyword() {
        const keywordList: string[] = this.keywordInput.split(',');
        if (keywordList.length) {
            keywordList.forEach((keyword) => {
                const cleanKeyword = keyword.toLocaleLowerCase().trim();
                const isValid = !this.node.keywords.find(k => k === cleanKeyword);

                if (cleanKeyword && isValid) {
                    this.node.keywords.push(keyword.toLocaleLowerCase().trim());
                }
            });
        }
        this.keywordInput = null;

        this.nodeChange.emit();
    }

    /**
     * Removes keyword from list
     */
    removeKeyword(index: number) {
        this.node.keywords.splice(index, 1);
        this.nodeChange.emit();
    }

    /**
     * Returns a list of similar match objects
     */
    getSimilarMatches(): SimilarMatch[] {
        const matchThreshold = 0.70;
        const foundSimilar: SimilarMatch[] = [];

        this.nodes.forEach((item, index) => {
            if (index !== this.nodeIndex) {
                const intersection: string[] = this.nodes[this.nodeIndex].keywords.filter(k => item.keywords.includes(k));
                const union: string[] = [];

                this.nodes[this.nodeIndex].keywords.forEach(i => {
                    union.push(i);
                });

                item.keywords.forEach(i => {
                    if (!union.find(e => e === i)) {
                        union.push(i);
                    }
                });

                if ((intersection.length / union.length) > matchThreshold) {
                    foundSimilar.push({
                        percentage: (intersection.length / union.length),
                        friendlyName: item.friendlyName
                    });
                }
            }
        });

        foundSimilar.sort((a, b) => {
            return a.percentage - b.percentage;
        });

        return foundSimilar;
    }

    /** Set up routine for localization. */
    private async initLocalization() {
        const tokens: string[] = Object.keys(TranslationTokens).map(k => TranslationTokens[k]);
        const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);
        this.tTokens.enterKeywordsHere = translatedTokens[TranslationTokens.enterKeywordsHere];
    }
}
