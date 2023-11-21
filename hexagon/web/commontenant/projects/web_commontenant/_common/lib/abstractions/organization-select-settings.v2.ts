import { BehaviorSubject } from 'rxjs';

export class OrganizationSelectSettings$v2 {

    /** Notification for when alarmIds change */
    private selectedTenants = new BehaviorSubject<string[]>(null);

    /** Observable for alarm ids. */
    readonly selectedTenants$ = this.selectedTenants.asObservable();

    constructor() { }

    /**
     * Set the selectedTenants
     * @param selectedTenants A list of shareeTenantInfo objects
     */
    setSelectedTenants(selectedTenants: string[]) {
        this.selectedTenants.next(selectedTenants);
    }
}
