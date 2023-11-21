import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Industries$v1 } from '@galileo/web_commontenant/_common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'hxgn-commontenant-industries-selector',
    templateUrl: 'industries-selector.component.html',
    styleUrls: ['industries-selector.component.scss']
})
export class IndustriesSelectorComponent implements OnInit, OnDestroy {

    /** List of selected industry ids */
    @Input() selectedIndustryIds: string[] = [];

    /** Map of industries by sector. Key is sector token. */
    @Input() industries: Map<string, Industries$v1[]>;

    /** Event when the selected industries change */
    @Output() selected = new EventEmitter<string>();

    private translationMapping = new Map<string, string>();

    private industryTokens: string[] = [];

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(private localizationSrv: CommonlocalizationAdapterService$v1) { }

    /** On init lifecycle hook */
    async ngOnInit(): Promise<void> {
        await this.localizeIndustriesAsync();

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.localizeIndustriesAsync();
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /** Localizes each of the industry names */
    private async localizeIndustriesAsync() {
        this.industries.forEach((industryList, key) => {
            this.industryTokens = this.industryTokens.concat(industryList.map(x => x.nameToken));
        });

        const translatedTokens = await this.localizationSrv.getTranslationAsync(this.industryTokens);
        this.industryTokens.forEach((token: string) => {
            this.translationMapping.set(token, translatedTokens[token]);
        });

        this.sortIndustries();
    }

    /** Sorts the industry list */
    private sortIndustries() {
        this.industries.forEach((industryList, key) => {
            industryList = industryList.sort((a, b) => {
                if (this.translationMapping.get(a.nameToken) < this.translationMapping.get(b.nameToken)) {
                    return -1;
                } else {
                    return 1;
                }
            });
        });
    }

    /**
     * Method used by ngFor to track an item in the list
     * @param index Index of item
     * @param item Obj
     */
    trackByFn(index, item) {
        return item.id;
    }
}
