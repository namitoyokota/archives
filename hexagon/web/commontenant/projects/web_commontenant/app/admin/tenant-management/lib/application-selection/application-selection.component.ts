import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Application$v1 } from '@galileo/web_commontenant/_common';
import { ApplicationStoreService } from '@galileo/web_commontenant/app/_core';
import { first, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'hxgn-commontenant-application-selection',
    templateUrl: 'application-selection.component.html',
    styleUrls: ['application-selection.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationSelectionComponent implements OnInit, OnDestroy {

    /** List of apps that are selected */
    @Input() selectedApps: string[] = [];

    /** Map of translated tokens. */
    tTokens: Map<string, string> = new Map<string, string>();

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        public appStore: ApplicationStoreService,
        private localizationSrv: CommonlocalizationAdapterService$v1
    ) { }

    /**
     * On init lifecycle hook
     */
    ngOnInit(): void {
        this.loadTokens();

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.loadTokens();
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    private loadTokens() {
        this.appStore.entity$.pipe(first()).subscribe((list: Application$v1[]) => {
            let tokenList: string[] = [];
            for (const item of list) {
                tokenList = tokenList.concat([item.nameToken, item.descriptionToken]);
            }

            this.localizationSrv.localizeStringsAsync(tokenList).then(async () => {
                const translatedTokens = await this.localizationSrv.getTranslationAsync(tokenList);
                list.forEach((item: Application$v1) => {
                    this.tTokens.set(item.descriptionToken, translatedTokens[item.descriptionToken]);
                });
            });
        });
    }

    /**
     * Returns true if the given app is selected
     * @param id App id to check if it is selected
     */
    isSelected(id: string): boolean {
        return this.selectedApps.some(appId => appId === id);
    }
}
