import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ShareeTenantInfo$v1 } from './sharee-tenant-info.v1';

export class OrganizationSelectSettings$v1 {

    /** Notification for when alarmIds change */
    private selectedTenants = new BehaviorSubject<ShareeTenantInfo$v1[]>(null);

    /** Observable for alarm ids. */
    readonly selectedTenants$ = this.selectedTenants.asObservable().pipe(
        filter(ids => !!ids)
    );

    constructor() { }

    /**
     * Set the selectedTenants
     * @param selectedTenants A list of shareeTenantInfo objects
     */
    setSelectedTenants(selectedTenants: ShareeTenantInfo$v1[]) {
        this.selectedTenants.next(selectedTenants);
    }
}
