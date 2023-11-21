import { BehaviorSubject } from 'rxjs';

import { Tenant$v1 } from '@galileo/platform_commontenant';

export class OrganizationListSettings$v1 {

    /** List of organizations to display in the list */
    private organizationList = new BehaviorSubject<string[]>(null);

    /** List of organizations to display in the list */
    readonly organizationList$ = this.organizationList.asObservable();

    /** Currently selected organization */
    private selectedOrganization = new BehaviorSubject<Tenant$v1>(null);

    /** Currently selected organization */
    readonly selectedOrganization$ = this.selectedOrganization.asObservable();

    /** String to filter tenants list */
    private searchString = new BehaviorSubject<string>('');

    /** String to filter tenants list */
    readonly searchString$ = this.searchString.asObservable();

    /** Flag to display overview button */
    private showOverview = new BehaviorSubject<boolean>(false);

    /** Flag to display overview button */
    readonly showOverview$ = this.showOverview.asObservable();

    /** Flag to display system button */
    private showSystem = new BehaviorSubject<boolean>(false);

    /** Flag to display system button */
    readonly showSystem$ = this.showSystem.asObservable();

    /** Flag to display onboarding indicator */
    private showOnboarding = new BehaviorSubject<boolean>(false);

    /** Flag to display onboarding indicator */
    readonly showOnboarding$ = this.showOnboarding.asObservable();

    /** Flag to display delete tenant button */
    private showDelete = new BehaviorSubject<boolean>(false);

    /** Flag to display delete tenant button */
    readonly showDelete$ = this.showDelete.asObservable();

    /** Flag to display deleted tenants */
    private showDeleted = new BehaviorSubject<boolean>(false);

    /** Flag to display deleted tenants */
    readonly showDeleted$ = this.showDeleted.asObservable();

    /** Id of the currently selected tenant */
    private selectionChange = new BehaviorSubject<Tenant$v1>(null);

    /** Id of the currently selected tenant */
    readonly selectionChange$ = this.selectionChange.asObservable();

    constructor() { }

    /**
     * Sets the organization list
     */
    setOrganizationsList(ids: string[]) {
        this.organizationList.next(ids);
    }

    /**
     * Sets selected organization
     */
    setSelectedOrganization(tenant: Tenant$v1) {
        this.selectedOrganization.next(tenant);
    }

    /**
     * Sets the search string for filtering
     * @param search String to search in list by
     */
    setSearchString(search: string): void {
        this.searchString.next(search);
    }

    /**
     * Sets if the overview button should be shown
     * @param flag A flag that is true if list should include overview
     */
    setShowOverview(flag: boolean): void {
        this.showOverview.next(flag);
    }

    /**
     * Sets if the system button should be shown
     * @param flag A flag that is true if list should include system
     */
    setShowSystem(flag: boolean): void {
        this.showSystem.next(flag);
    }

    /**
     * Sets if the onboarding indicator should be shown
     * @param flag A flag that is true if onboarding indicator should be shown
     */
    setShowOnboarding(flag: boolean): void {
        this.showOnboarding.next(flag);
    }

    /**
     * Sets if the delete button should be shown
     * @param flag A flag that is true if delete button should be shown
     */
    setShowDelete(flag: boolean): void {
        this.showDelete.next(flag);
    }

    /**
     * Sets if the deleted tenants should be down
     * @param flag A flag that is true if deleted tenants should be shown
     */
    setShowDeleted(flag: boolean): void {
        this.showDeleted.next(flag);
    }

    /**
     * Event that selection should change
     * @param organization Selected organization
     */
    changeSelection(organization: Tenant$v1) {
        this.selectionChange.next(organization);
    }
}
