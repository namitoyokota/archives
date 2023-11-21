import { Component, Input } from '@angular/core';
import { KeywordNode$v1 } from '@galileo/web_commonkeywords/_common';

import { TranslationTokens } from './similar-matches.translation';

export interface SimilarMatch {
    /** How much does it match */
    percentage: number;
    /** Friendly name of the rule that matches */
    friendlyName: string;
}

@Component({
    selector: 'hxgn-commonkeywords-similar-matches',
    templateUrl: 'similar-matches.component.html',
    styleUrls: ['similar-matches.component.scss']
})
export class SimilarMatchesComponent {

    /** List of nodes used to look for similar matches */
    @Input() readonly nodes: KeywordNode$v1[];

    /** Index in the nodes list of the item that is being checked */
    @Input() nodeIndex: number;

    /** Expose TranslationTokens to the HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    constructor() { }

    /**
     * Return list of similar matches
     */
    getSimilarMatches(): SimilarMatch[] {
        const matchThreshold = 0.70;
        let foundSimilar: SimilarMatch[] = [];

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

        foundSimilar = foundSimilar.sort((a, b) => {
            return b.percentage - a.percentage;
        });

        return foundSimilar;
    }

    /**
     * Returns true if the first similar match has a 100% match
     * @param matches The match list to check for errors
     */
    hasErrorMatch(matches: SimilarMatch[]): boolean {
        if (matches.length) {
            return matches[0].percentage === 1;
        }

        return false;
    }

    /**
     * Returns true if the first similar match has at least a 70% match
     * @param matches The match list to check for errors
     */
    hasWarningMatch(matches: SimilarMatch[]): boolean {
        if (matches.length) {
            return (matches[0].percentage !== 1 && matches[0].percentage >= 0.70);
        }

        return false;
    }

    /**
     * Give a number returns a text percentage
     */
    getMatchPercentageText(num: number): string {
        return `${Math.round(num * 100)}%`;
    }

}
