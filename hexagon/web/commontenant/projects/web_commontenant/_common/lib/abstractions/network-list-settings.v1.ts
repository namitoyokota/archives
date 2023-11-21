import { BehaviorSubject } from 'rxjs';


export class NetworkListSettings$v1 {
    /** Id of the currently selected tenant */
    private selectedNetworks = new BehaviorSubject<string[]>(null);

    /** Id of the currently selected tenant */
    readonly selectedNetworks$ = this.selectedNetworks.asObservable();

    constructor() {}

    /**
     * Event containing selected networks
     * @param networks the selected networks to emit
     */
    setSelectedNetworks(networks: string[]) {
        this.selectedNetworks.next(networks);
    }
}
