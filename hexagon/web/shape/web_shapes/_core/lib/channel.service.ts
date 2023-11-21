import { ComponentRef, Injectable, Injector } from '@angular/core';
import {
  ChangeOperation$v1,
  ChangeRecord$v1,
  Descriptor$v1,
  EntityHistoryStoreService$v1,
} from '@galileo/web_common-libraries';
import {
  ChannelAssociatedData$v1,
  ChannelService$v1,
  EntityTenant$v1,
  IndexEntry$v1,
} from '@galileo/web_commonconversations/adapter';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { MapCommunication$v1 } from '@galileo/web_commonmap/adapter';
import { capabilityId, InjectableComponentNames, Shape$v1, ShapeHistoryItemSettings$v1 } from '@galileo/web_shapes/_common';
import { combineLatest, Observable } from 'rxjs';
import { filter, first, map, timeout } from 'rxjs/operators';

import { DataService } from './data.service';
import { CardListInjectableComponentSettings } from './injectable-component/card-list/card-list.component';
import { MapService } from './map.service';
import { ShapeStoreService } from './shape-store.service';
import { TombstonedService } from './tombstoned.service';

/**
 * Interface used to process a request to get history
 */
interface HistoryProcessGroup {
  /** Groups are made by tenant id */
  tenantId: string;

  /** Index entries grouped by incident id */
  indexEntries: Map<string, IndexEntry$v1[]>;
}

@Injectable()
export class ChannelService extends ChannelService$v1 {

  private readonly capabilityNameToken = 'shape-core.capability.nameSmartShapes';

  private readonly channelIcon = 'assets/shapes/images/channel-icon.svg';

  private readonly contextId = 'shape-channel';

  private readonly conversationAssociationId = '@hxgn/commonconversations & @hxgn/shapes';

  private readonly associationIds = [this.conversationAssociationId];

  constructor(
    injector: Injector,
    private localizationAdapter: CommonlocalizationAdapterService$v1,
    private shapeStore: ShapeStoreService,
    private tombstonedSrv: TombstonedService,
    private historySrv: EntityHistoryStoreService$v1,
    private dataSrv: DataService,
    private layoutAdapter: LayoutCompilerAdapterService,
    private mapSrv: MapService,
  ) {
    super(injector);
  }

  /**
   * Returns the capability id
   */
  getCapabilityId(): string {
    return capabilityId;
  }

  /**
   * Returns the string name of the capability
   */
  getCapabilityNameAsync(): Promise<string> {
    return new Promise<string>(async resolve => {
      await this.localizationAdapter.localizeStringsAsync([this.capabilityNameToken]);
      const name = await this.localizationAdapter.getTranslationAsync(this.capabilityNameToken);
      resolve(name);
    });
  }

  /**
   * Life cycle hook to load data. Is called before any rejection request are made.
   * @param entries List of index entries
   */
  async loadTimelineDataAsync(entries: IndexEntry$v1[]): Promise<void> {
    // Get list of shape entries
    const shapeEntries: IndexEntry$v1[] = entries.filter(x => x.capabilityId === capabilityId);

    // Get list of conversation entries
    const conversationEntries: IndexEntry$v1[] = entries.filter(x => x.associationId === this.conversationAssociationId);

    if (shapeEntries?.length) {
      await this.loadShapesTimelineDataAsync(shapeEntries);
    }

    if (conversationEntries?.length) {
      await this.loadConversationTimelineDataAsync(conversationEntries);
    }
  }

  /**
   * Inject the timeline icon component
   * @param id Id of the element where the component should be injected into.
   * @param entry Index entry
   */
  injectTimelineIconAsync(id: string, entry: IndexEntry$v1): Promise<any> {
    return new Promise<ComponentRef<any>>(async resolve => {

      const shapeId: string = this.setShapeId(entry);


      let ref: ComponentRef<any>;
      if (shapeId) {

        ref = await this.layoutAdapter.delegateInjectComponentPortalAsync(
          InjectableComponentNames.iconComponent,
          capabilityId, `#${id}`, shapeId
        );
      }
      resolve(ref);
    });
  }

  /**
   * Inject the main timeline item component
   * @param id Id of the element where the component should be injected into;
   * @param entry Index entry for this timeline item
   */
  injectTimelineItemAsync(id: string, entry: IndexEntry$v1): Promise<any> {
    return new Promise<ComponentRef<any>>(async resolve => {
      const shapeId: string = this.setShapeId(entry);

      // Wait for all items to load
      // await this.eventSrv.dataReady$.pipe(
      //   filter(isReady => isReady),
      //   first()
      // ).toPromise();

      // Current shape
      const shape$: Observable<Shape$v1> = this.shapeStore.entity$.pipe(
        timeout(5000),
        map(items => items?.find(x => x.id === shapeId))
      );

      const lookupId: string = (entry?.associationId === this.conversationAssociationId) ? entry?.entityId : shapeId;

      const operations$: Observable<ChangeOperation$v1[]> = this.historySrv.get$(lookupId, this.contextId)?.pipe(
        map((items: ChangeRecord$v1[]) => {
          return items.find(item => item.timestamp === entry.creationTime)?.operations;
        })
      );

      // Get history item
      const settings = new ShapeHistoryItemSettings$v1({
        concise: false,
        shapeId: await shape$.pipe(first(), map(a => a.id)).toPromise().catch(err => {
          return null;
        }),
        operations: await operations$.pipe(first()).toPromise(),
      });

      let ref: ComponentRef<any>;
      if (entry?.associationId === this.conversationAssociationId) {
        ref = await this.layoutAdapter.delegateInjectComponentPortalAsync(
          InjectableComponentNames.channelAssociatedHistoryItem,
          capabilityId, `#${id}`, settings
        );
      } else {
        ref = await this.layoutAdapter.delegateInjectComponentPortalAsync(
          InjectableComponentNames.historyItemComponent,
          capabilityId, `#${id}`, settings
        );
      }

      resolve(ref);
    });
  }

  /**
   * Returns the title
   * @param entry Index entry
   */
  getTimelineTitleAsync(entry: IndexEntry$v1): Promise<string> {
    const shapeId: string = this.setShapeId(entry);
    const title$: Observable<string> = this.shapeStore.entity$.pipe(
      timeout(5000),
      filter(items => !!items && !!items.find(x => x.id === shapeId)),
      map(items => {
        return items.find(x => x.id === shapeId)?.name;
      })
    );

    return title$.pipe(
      first()
    ).toPromise().catch(async err => {
      // Get error message
      const token = 'shape-main.component.shapeNotBeingShown';
      return await this.localizationAdapter.getTranslationAsync(token) as string;
    });
  }

  /**
   * Event that is raised when channel data should be cleared
   */
  clearTimelineChannelData(): void {
    this.tombstonedSrv.release(this.contextId);
    this.historySrv.removeByContextId(this.contextId);
  }

  /**
   * Returns the url for the icon that is displayed on the data association dialog.
   */
  getDataAssociationIconURL(): string {
    return this.channelIcon;
  }

  /**
   * Returns a stream of ChannelAssociatedData$v1 objects that can be associated with the channel
   * @param searchString$ A search string that can be used to filter down the list of entity ids
   */
  getDataAssociationIDs$(searchString$: Observable<string>): Observable<ChannelAssociatedData$v1[]> {
    return combineLatest([
      this.shapeStore.entity$,
      searchString$
    ]).pipe(map(([shapes, searchString]) => {
      const data: ChannelAssociatedData$v1[] = [];

      // Filter items by search string
      if (searchString) {
        shapes = shapes.filter((shape: Shape$v1) => {
          return shape.name.toLocaleLowerCase().includes(searchString?.toLocaleLowerCase());
        });
      }

      // Build list of tenant ids
      let tenantIds: string[] = shapes.map(x => x.tenantId);
      tenantIds = [...new Set(tenantIds)];
      tenantIds.forEach((id: string) => {
        data.push(new ChannelAssociatedData$v1({
          tenantId: id,
          entityIds: shapes.filter(x => x.tenantId === id).map(x => x.id)
        }));
      });

      return data;
    }));
  }

  /**
   * Injects the data association item
   * @param id Id of the element where the component should be injected into
   * @param entityId Id of then entity. Example unit id.
   */
  injectDataAssociationItemAsync(id: string, entityId: string): Promise<void> {
    return new Promise<void>(async resolve => {
      await this.layoutAdapter.delegateInjectComponentPortalAsync(
        InjectableComponentNames.simpleCardComponent,
        capabilityId, `#${id}`, entityId
      );

      resolve();
    });
  }

  /**
   * Injects association list component
   * @param id Id of the element where the component should be injected into
   * @param entityIds Stream of entity ids
   */
  injectAssociationListAsync(id: string, entityIds: Observable<EntityTenant$v1[] | string[]>): Promise<void | ComponentRef<any>> {
    return new Promise<ComponentRef<any>>(async resolve => {
      const ref = await this.layoutAdapter.delegateInjectComponentPortalAsync(
        InjectableComponentNames.cardListComponent,
        capabilityId, `#${id}`, {
          ids: entityIds,
          contextId: this.contextId
        } as CardListInjectableComponentSettings
      );

      resolve(ref);
    });
  }

  /**
   * Destroy map association
   * @param mapComm Map communication object
   */
  destroyMapAssociation(mapComm: MapCommunication$v1): void {
    this.mapSrv.removeMapForChannels(mapComm);
  }

  /**
   * Setup map association
   * @param mapComm Map communication object
   * @param entityIds Stream of entity ids
   */
  setupMapAssociation(mapComm: MapCommunication$v1, entityIds$: Observable<string[]>): void {
    this.mapSrv.addMapForChannels(mapComm, entityIds$);
  }

  /**
   * Returns a list of association ids the capability is responsible for
   */
  getAssociationIds(): string[] {
    return this.associationIds;
  }

  private setShapeId(entry: IndexEntry$v1): string {
    let shapeId: string = entry.entityId;
    if (entry?.associationId === this.conversationAssociationId) {
      // Parse out the entity id
      shapeId = entry.entityId.split(':')[3];
    }

    return shapeId;
  }

  /**
     * Load timeline data for shapes
     */
  private async loadShapesTimelineDataAsync(entries: IndexEntry$v1[]): Promise<void> {
    let apiCalls = [];

    const groups: HistoryProcessGroup[] = this.createProcessGroups(entries);
    groups.forEach((group: HistoryProcessGroup) => {
      // Create descriptors
      let descriptors = [];
      group.indexEntries.forEach(async (list, id) => {
        descriptors = [...descriptors, this.createDescriptor(id, list)];
      });

      // Make data call
      apiCalls = [...apiCalls, this.dataSrv.timeline$(descriptors, group.tenantId).toPromise()];
    });

    // Wait on calls
    if (apiCalls?.length) {
      const results: Map<string, ChangeRecord$v1[]>[] = await Promise.all(apiCalls);

      // Load results into history store
      results.forEach((historyGroups: Map<string, ChangeRecord$v1[]>) => {
        historyGroups.forEach((records, id) => {
          this.historySrv.concatenate(id, records, this.contextId);
        });
      });
    }

  }

  /**
   * Creates a list of history process groups to makes processing data easier
   * @param entries List of index entries
   */
  private createProcessGroups(entries: IndexEntry$v1[]): HistoryProcessGroup[] {

    // Break index entries into groups
    // Each tenant must be it's own request group
    let requestGroups: HistoryProcessGroup[] = [];

    entries.forEach((entry: IndexEntry$v1) => {
      let group: HistoryProcessGroup = requestGroups.find(g => g.tenantId === entry.tenantId);
      if (!group) {
        group = {
          tenantId: entry.tenantId,
          indexEntries: new Map<string, IndexEntry$v1[]>()
        } as HistoryProcessGroup;
      }

      if (group.indexEntries.has(entry.entityId)) {
        let list = group.indexEntries.get(entry.entityId);
        list = [...list, entry];
        group.indexEntries.set(entry.entityId, list);
      } else {
        group.indexEntries.set(entry.entityId, [entry]);
      }

      // Update the group list
      if (!requestGroups) {
        requestGroups = [group];
      } else {

        // Check if group exists
        if (requestGroups.find(g => g.tenantId === entry.tenantId)) {
          requestGroups = requestGroups.map((g: HistoryProcessGroup) => {
            if (g.tenantId === entry.tenantId) {
              g = group;
            }

            return g;
          });
        } else {
          requestGroups = [...requestGroups, group];
        }
      }
    });

    return requestGroups;
  }

  /**
   * Creates a descriptor for getting history data
   * @param id Shape id
   * @param entries List of index entries
   */
  private createDescriptor(id: string, entries: IndexEntry$v1[]): Descriptor$v1 {
    entries.sort((a, b) => {
      if (a.creationTime < b.creationTime) {
        return 1;
      } else {
        return -1;
      }
    });

    return new Descriptor$v1({
      id,
      changeRecordCreationTime: entries[0].creationTime,
      pageSize: entries.length
    });
  }

  /**
     * Load timeline data for conversation with shapes
     */
  private async loadConversationTimelineDataAsync(entries: IndexEntry$v1[]): Promise<void> {
    let apiCalls = [];

    const groups: HistoryProcessGroup[] = this.createProcessGroups(entries);
    groups.forEach((group: HistoryProcessGroup) => {
      // Create descriptors
      let descriptors = [];
      group.indexEntries.forEach(async (list, id) => {
        descriptors = [...descriptors, this.createDescriptor(id, list)];
      });

      // Make data call
      apiCalls = [...apiCalls, this.getAssociationTimelineAsync(capabilityId, descriptors)];
    });

    // Wait on calls
    if (apiCalls?.length) {
      const results: Map<string, ChangeRecord$v1[]>[] = await Promise.all(apiCalls);

      // Load results into history store
      results.forEach((historyGroups: Map<string, ChangeRecord$v1[]>) => {
        historyGroups.forEach((records, id) => {
          this.historySrv.concatenate(id, records, this.contextId);
        });
      });
    }
  }

}
