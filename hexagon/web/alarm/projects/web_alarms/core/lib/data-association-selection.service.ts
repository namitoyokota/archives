import { Injectable, Injector } from '@angular/core';
import { StoreService } from '@galileo/web_common-libraries';
import { DataSelectionService$v1, EntityAssociatedData$v1 } from '@galileo/web_commonassociation/adapter';
import { capabilityId, Alarm$v1 } from '@galileo/web_alarms/_common';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable()
export class DataAssociationSelectionService extends DataSelectionService$v1{
    /** Id of the current capability */
    capabilityId = capabilityId;

    /** URL to the icon to show for the capability */
    readonly capabilityIconUrl = 'assets/alarms-core/images/channel-icon.svg';

    /** Token to use for the name of the capability */
    nameToken = 'alarm-core.capability.name';

    /** Name of component to inject into the selection list */
    dataAssociationItemComponentName = '@hxgn/alarms/simplecard/v1';

    constructor(
        injector: Injector,
        private store: StoreService<Alarm$v1>
    ) { 
        super(injector);
    }

    /**
     * Get a list of associated data ids that are to be shown in the selection list
     */
     getDataAssociationIDs$(searchString$: Observable<string>): Observable<EntityAssociatedData$v1[]> {
        return combineLatest([
            this.store.entity$,
            searchString$
        ]).pipe(map(([alarms, searchString]) => {
            const data: EntityAssociatedData$v1[] = [];

            // Filter items by search string
            if (searchString) {
                alarms = alarms.filter((alarm: Alarm$v1) => {
                    return alarm.title.toLocaleLowerCase().includes(searchString?.toLocaleLowerCase());
                });
            }

            // Build list of tenant ids
            let tenantIds: string[] = alarms.map(alarm => alarm.tenantId);
            tenantIds = [...new Set(tenantIds)];
            tenantIds.forEach((id: string) => {
                data.push(new EntityAssociatedData$v1({
                    tenantId: id,
                    entityIds: alarms.filter(alarm => alarm.tenantId === id).map(alarm => alarm.id)
                }));
            });

            return data;
        }));
    }

}