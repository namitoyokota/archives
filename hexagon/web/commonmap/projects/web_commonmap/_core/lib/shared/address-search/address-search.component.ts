import { Component, Inject, Input, OnInit, ViewChild, OnDestroy, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { CommonErrorDialogComponent, Location$v1 } from '@galileo/web_common-libraries';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CommonmapDataService$v1 } from '../../commonmap-data.service';
import { TranslatedTokens, TranslationTokens } from './address-search.translation';

@Component({
    selector: 'hxgn-commonmap-address-search',
    templateUrl: 'address-search.component.html',
    styleUrls: ['address-search.component.scss']
})

export class AddressSearchComponent implements OnInit, OnDestroy {

    /** Reference to mat menu component */
    @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;

    /** Current location to display address of */
    @Input() location: Location$v1;

    /** Fires when address changes */
    @Output() locationChanged: EventEmitter<Location$v1> = new EventEmitter<Location$v1>();

    /** List of addresses to select from */
    locationOptions: Location$v1[] = [];

    /** Flag to indicate during address lookup */
    isLoading = false;

    /** Expose translation tokens to html */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Translated tokens */
    tTokens: TranslatedTokens = {} as TranslatedTokens;

    /** Destory subscription */
    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private dataSrv: CommonmapDataService$v1,
        private dialog: MatDialog
    ) { }

    /** On init lifecycle hook */
    ngOnInit() {
        this.initLocalizationAsync();

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalizationAsync();
        });
    }

    /** On destroy lifecycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /** Searches closest addresses */
    search() {
        this.menuTrigger.closeMenu();
        this.isLoading = true;

        this.dataSrv.geolocation.searchAddress$(this.location.formattedAddress).toPromise().then(addresses => {
            this.locationOptions = addresses;
            this.isLoading = false;
            this.openDropdown();
        });
    }

    /** Open dropdown menu if options exist */
    openDropdown() {
        const hasOptions = this.locationOptions.length;
        if (hasOptions) {
            this.menuTrigger.openMenu();
        } else {
            this.dialog.open(CommonErrorDialogComponent, {
                data: {
                    message: this.tTokens.noLocationsFound
                }
            });
        }
    }

    /** Reset address options from previous search */
    resetSearch() {
        this.locationOptions = [];
    }

    /** Fills fields when new address is selected */
    select(location: Location$v1) {
        this.menuTrigger.closeMenu();
        this.resetSearch();
        this.location = location;
        this.updateAddress();
    }

    /** Emits notification for address string change */
    updateAddress() {
        this.locationChanged.emit(this.location);
    }

    /** Set up routine for localization */
    private async initLocalizationAsync(): Promise<void> {
        const tokens: string[] = Object.keys(TranslationTokens).map(k => TranslationTokens[k]);
        const translatedTokens = await this.localizationSrv.getTranslationAsync(tokens);
        this.tTokens.enterAddress = translatedTokens[TranslationTokens.enterAddress];
        this.tTokens.noLocationsFound = translatedTokens[TranslationTokens.noLocationsFound];
    }
}
