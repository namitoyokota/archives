import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { DataService$v2 } from '../../data.service.v2';
import { TranslatedTokens, TranslationTokens } from './network-list.translation';

class NetworkState {
    /** Name of the network */
    name: string;

    /** Whether network is on for current tenant */
    checked: boolean;
}

@Component({
    selector: 'hxgn-commontenant-network-list',
    templateUrl: './network-list.component.html',
    styleUrls: ['./network-list.component.scss']
})
export class NetworkListComponent implements OnInit, OnDestroy {

    /** Currently active networks */
    @Input('activeNetworks')
    set setSelectedNetworks(networks: string[]) {
        this.activeNetworks.next(networks);
    }

    /** Selected networks for tenant */
    @Output() selectedNetworks = new EventEmitter<string[]>();

    /** List of all networks in the system */
    allNetworks: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

    /** List of active networks for this tenant */
    activeNetworks: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

    /** States of all possible networks and checks */
    networkStates: Observable<NetworkState[]> = combineLatest([
        this.allNetworks.asObservable(),
        this.activeNetworks.asObservable()
    ]).pipe(
        map(([all, active]) => {
            // Concat two lists but remove duplicates
            const combinedList = [...new Set([...all, ...active])].sort((a, b) => a > b ? 1 : -1);
            return combinedList.map(network => {
                return {
                    name: network,
                    checked: active.some(n => n === network)
                } as NetworkState;
            });
        })
    );

    /** Name of the network being created */
    newNetwork = '';

    /** Whether the net network string is valid */
    valid: boolean = null;

    /**  Collection of known translation tokens */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Flag that is true if data is loading */
    loading$ = new BehaviorSubject<boolean>(false);

    /** Translated tokens */
    tTokens: TranslatedTokens = {} as TranslatedTokens;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private dataSrv: DataService$v2,
    ) { }

    /** On init lifecycle hook */
    async ngOnInit(): Promise<void> {
        this.initLocalizationAsync();
        this.resetNetwork();

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalizationAsync();
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /** Resets the network to match the database */
    async resetNetwork(): Promise<void> {
        this.loading$.next(true);
        this.allNetworks.next(await this.dataSrv.tenant.getNetworks$().toPromise());
        this.loading$.next(false);
    }

    /** Add new network to the list */
    addNetwork(): void {
        if (this.allNetworks.getValue().some(n => n === this.newNetwork)) {
            this.valid = false;
        } else {
            this.allNetworks.next([...this.allNetworks.getValue(), this.newNetwork]);
            this.activeNetworks.next([...this.activeNetworks.getValue(), this.newNetwork]);
            this.selectedNetworks.emit(this.activeNetworks.getValue());
            this.sortByCheckedAlphabetically();
            this.valid = null;
            this.newNetwork = '';
        }
    }

    /** On network change */
    handleChange(network: NetworkState) {
        if (network.checked) {
            this.activeNetworks.next(this.activeNetworks.getValue().filter(n => n !== network.name));
        } else {
            this.activeNetworks.next([...this.activeNetworks.getValue(), network.name]);
        }

        this.selectedNetworks.emit(this.activeNetworks.getValue());
    }

    /** Capitalize current network name */
    capitalize() {
        this.newNetwork = this.newNetwork.charAt(0).toLocaleUpperCase() + this.newNetwork.slice(1);
    }

    /** Sort the list of networks */
    sortByCheckedAlphabetically() {
        this.allNetworks.next(this.allNetworks.getValue().sort((a, b) => {
            if (a < b) { return - 1; }
            if (a > b) { return 1; }
            return 0;
        }));
    }

    /** Set up routine for localization */
    private async initLocalizationAsync(): Promise<void> {
        const tokens: string[] = Object.keys(TranslationTokens).map(k => TranslationTokens[k]);
        const translatedTokens = await this.localizationSrv.getTranslationAsync(tokens);
        this.tTokens.addNetwork = translatedTokens[TranslationTokens.addNetwork];
    }
}
