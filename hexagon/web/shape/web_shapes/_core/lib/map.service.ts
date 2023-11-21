import { ApplicationRef, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonErrorDialogComponent, Location$v1 } from '@galileo/web_common-libraries';
import { CommonconversationsAdapterService$v1 } from '@galileo/web_commonconversations/adapter';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import {
  CommonmapAdapterService$v1,
  Geometry$v1,
  GeometryContextMenuItem$v1,
  LayerCollection$v1,
  LayerFormat$v1,
  MapCommunication$v1,
  MapDataRequest$v1,
  MapDrawSetup$v1,
  MapLayer$v1,
  VectorStyleProperties$v1,
} from '@galileo/web_commonmap/adapter';
import { capabilityId, Shape$v1, ShapeFilter$v1, ShapeListFilter$v1 } from '@galileo/web_shapes/_common';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { filter, first, map, startWith, takeUntil } from 'rxjs/operators';

import { ActionStoreService, FilterActionData$v1 } from './action-store.service';
import { DataService } from './data.service';
import { ShapeStoreService } from './shape-store.service';
import { CreateEditComponent } from './shared/create-edit-dialog/create-edit-dialog.component';

enum MapTranslationTokens {
  editSmartShape = 'shape-main.component.editSmartShape',
  useAsFilter = 'shape-main.component.useAsFilter',
  clearFilter = 'shape-main.component.clearFilter',
  createChannel = 'shape-main.component.createChannel',
  shapeActions = 'shape-main.component.shapeActions'
}

interface MapTranslatedTokens {
  editSmartShape: string;
  useAsFilter: string;
  clearFilter: string;
  createChannel: string;
  shapeActions: string;
}

enum ContextMenuActions {
  shapeMenu = 'ShapeMenu',
  useAsFilter = 'UseAsFilter',
  clearFilter = 'ClearFilter',
  editSmartShape = 'EditSmartShape',
  createChannel = 'CreateChannel'
}

export class MapController {

  /** map communication. */
  mapComm?: MapCommunication$v1;

  /** Map data request. */
  mapDataRequest?: MapDataRequest$v1;

  /** Reference to observable providing shape ids for channels */
  shapeIds$?: Observable<string[]>;

  /** Subscription reference for the shapeIds$ observable */
  shapeIdsRef$?: Subscription;

  /** List of ids for missing alarms in the store.  This happens when channels have tombstoned
   * items that they have not loaded in the store.
   */
  missingIds?: string[];

  /** Subject fired to shut down listener of store events */
  clearStoreEvents$?: Subject<void>;

  /** Subject fired when this map is destroyed */
  mapDestroyed$?: Subject<void>;

  constructor(params: MapController = {} as MapController) {
    const {
      mapComm = null,
      mapDataRequest = null,
      shapeIds$ = null,
      shapeIdsRef$ = null,
      missingIds = []
    } = params;

    this.mapComm = mapComm;
    this.mapDataRequest = mapDataRequest;
    this.shapeIds$ = shapeIds$;
    this.shapeIdsRef$ = shapeIdsRef$;
    this.missingIds = missingIds;
    this.mapDestroyed$ = new Subject<void>();
  }
}

@Injectable()
export class MapService {

  /** Array of map controller objects that store the map communication and markers for a given map */
  mapControllers: MapController[] = [];

  translatedStrings: any;

  /** Map of geometries by context id */
  mapGeometries = new Map<string, Geometry$v1[]>();

  /** Map of context menu item to subscription. Used to clean up subscriptions when geo goes away */
  geometryEvents = new Map<string, Subscription>();

  /** Map of context id to list of subscriptions to the store events. Used to clean up subscriptions when map goes away */
  storeEvents = new Map<string, Subscription[]>();

  /** The currently active tenant */
  private activeTenantId: string;

  /** Translated tokens */
  tTokens: MapTranslatedTokens = {
    editSmartShape: '',
    useAsFilter: '',
    clearFilter: '',
    createChannel: '',
    shapeActions: ''
  } as MapTranslatedTokens;

  constructor(
    private mapAdapter: CommonmapAdapterService$v1,
    private actionSrv: ActionStoreService,
    private shapeStore: ShapeStoreService,
    private dialog: MatDialog,
    private ref: ApplicationRef,
    private dataSrv: DataService,
    private localizationAdapter: CommonlocalizationAdapterService$v1,
    private conversationAdapter: CommonconversationsAdapterService$v1,
    private identityAdapter: CommonidentityAdapterService$v1
  ) {

    this.identityAdapter.getUserInfoAsync().then(user => {
      this.activeTenantId = user.activeTenant;
    });

    this.intLocalization();

    this.localizationAdapter.adapterEvents.languageChanged$.subscribe(() => {
      this.intLocalization();
    });

    this.mapAdapter.mapAdapterEvents.mapViewLoaded$.subscribe((mapComm: MapCommunication$v1) => {
      let layer: MapLayer$v1;
      let shapeGeom: Geometry$v1;
      let mapCont: MapController;

      const index = this.mapControllers.findIndex((cont) => {
        return (cont.mapComm.mapContextId === mapComm.mapContextId);
      });
  
      // Look to see if we have gotten the mapviewLoaded event for this map before.  It should not happen but
      // if it does we need to shut down all the subscriptions are restart.
      if (index !== -1) {
        mapCont = this.mapControllers[index];  
        this.cleanupEvents(mapComm);
        mapCont.mapDestroyed$.next();
        mapCont.mapDestroyed$.complete();
        mapCont.shapeIdsRef$ = null;
        this.mapControllers.splice(index, 1);
      }

      mapCont = new MapController({
        mapComm: mapComm
      } as MapController);
      this.mapControllers.push(mapCont);

      // Activate the draw toolbar in the maps
      const drawSetup = new MapDrawSetup$v1();
      drawSetup.drawButtonTooltip = 'Open Smart Filter Toolbar';  // Needs localization
      drawSetup.drawToolbarTitle = 'Draw A Shape Filter';
      mapComm.draw.activate(capabilityId, drawSetup);

      // Create the layer collection to add to the map where the shape filter layer is displayed.
      let layerColl = new LayerCollection$v1({ name: 'ShapeFilter' });

      // Create the geometry layer that will hold the polygon geometry for the shape filter
      layer = new MapLayer$v1({ name: 'ShapeFilter', format: LayerFormat$v1.Geometry });

      // Add layer collection to the map
      layerColl.addLayers([layer]);
      layerColl = mapComm.layers.addLayerCollection(layerColl);

      mapComm.draw.geometry$.pipe(
        takeUntil(mapCont.mapDestroyed$)
      ).subscribe(g => {
        this.actionSrv.shapeFilter(mapComm.mapContextId, {
          sourceId: g?.sourceId,
          radius: g?.radius,
          type: g?.type,
          coordinates: g?.coordinates,
          originId: mapComm.mapContextId
        } as ShapeFilter$v1);
      });

      mapComm.draw.start$.pipe(
        filter(item => item === capabilityId),
        takeUntil(mapCont.mapDestroyed$)
      ).subscribe(() => {
        layer.clearAllGeometries();
        if (shapeGeom) {
          mapComm.draw.edit(shapeGeom);
        }
      });

      this.actionSrv.shapeFilter$(mapComm.mapContextId).pipe(
        takeUntil(mapCont.mapDestroyed$)
      ).subscribe(shapeFilter => {
        if (shapeFilter?.type) {
          const g = new Geometry$v1({
            radius: shapeFilter.radius,
            type: shapeFilter.type,
            coordinates: shapeFilter.coordinates
          } as Geometry$v1);

          layer.clearAllGeometries();

          shapeGeom = g;

          //*  Set line color for shape filter geometry.
          g.style = new VectorStyleProperties$v1({
            lineColor: '#62B4FF'
          });

          // Create mask from the shape filter geometry
          g.useAsMask = true;

          if (shapeFilter.sourceId) {
            // Set clear style
            g.style = new VectorStyleProperties$v1({
              lineColor: '#00000000',
              fillColor: '#00000000'
            } as VectorStyleProperties$v1);

          }

          // Add the shape filter geometry to the map
          layer.upsertGeometries([g]);

          (mapComm.draw as any).displayFilterToolbar$.next(true);

        } else {

          (mapComm.draw as any).displayFilterToolbar$.next(false);

          // Remove the shape filter from the map
          shapeGeom = null;
          layer.clearAllGeometries();
        }
      });


      mapComm.mapEvents.mapDataRequest$.pipe(
        filter((mapDataRequest) => mapDataRequest && mapDataRequest.capabilityId === capabilityId),
        takeUntil(mapCont.mapDestroyed$)
      ).subscribe((mapDataRequest) => {
        // If we get a new map data request, we need to cleanup the events we currently have.  This should not happen.
        if (mapCont.mapDataRequest) {
          this.cleanupEvents(mapComm);
        }
        mapCont.mapDataRequest = mapDataRequest;
        this.handleMapDataRequest(mapCont);
      });

      mapComm.mapEvents.mapCommunicationClosed$.pipe(
        filter(item => !!item)
      ).subscribe(() => {
        const index = this.mapControllers.findIndex((cont) => {
          return (cont.mapComm.mapContextId === mapComm.mapContextId);
        });
    
        if (index !== -1) {
          mapCont = this.mapControllers[index];  
          this.cleanupEvents(mapComm);
          mapCont.mapDestroyed$.next();
          mapCont.mapDestroyed$.complete();
          mapCont.shapeIdsRef$ = null;
          this.mapControllers.splice(index, 1);
        }
      });
    });
  }

  cleanupEvents(mapComm: MapCommunication$v1) {
    const index = this.mapControllers.findIndex((cont) => {
      return (cont.mapComm.mapContextId === mapComm.mapContextId);
    });

    if (index !== -1) {
      const mapCont = this.mapControllers[index];
      
      if (mapCont.mapComm) {
        let mapGeometries = this.getMapGeometries(mapCont.mapComm.mapContextId);
        if (mapGeometries?.length) {
          const ids = mapGeometries.map(g => g.id);
  
          // clean up context listener
          ids.forEach(id => {
            const sub = this.geometryEvents.get(id);
            if (sub) {
              sub.unsubscribe();
              this.geometryEvents.delete(id);
            }
          });
        }
        this.mapGeometries.delete(mapCont.mapComm.mapContextId);

        const subs = this.storeEvents.get(mapCont.mapComm.mapContextId);
        if (subs) {
          for (const sub of subs) {
            if (sub) {
              sub.unsubscribe();
            }
          }
          this.storeEvents.delete(mapCont.mapComm.mapContextId);
        }

      }
      
    }
  }
  handleMapDataRequest(mapCont: MapController) {

    const dataLoaded$ = new BehaviorSubject<boolean>(false);

    this.listenToStoreEvents(mapCont);
    this.addShapesToMap(mapCont);
    dataLoaded$.next(true);
    this.listenToFilterChangeEvent(mapCont);
    this.listenToSelectionChangeEvent(mapCont);

    // Listen to clear
    this.actionSrv.shapeFilter$(mapCont.mapComm.mapContextId).subscribe((filter) => {
      // Update all the menus
      this.initContextMenu(this.getMapGeometries(mapCont.mapComm.mapContextId), mapCont.mapComm.mapContextId, filter.sourceId);
    });

  }

  private async addShapesToMap(mapCont: MapController, shapeListFilter: ShapeListFilter$v1 = null): Promise<void> {

    this.shapeStore.entity$.pipe(
      map(list => {
        let filterList = [];
        if (shapeListFilter) {
          filterList = shapeListFilter.apply(list);
        } else {
          filterList = list;
        }

        return filterList;

      }),
      first()
    ).subscribe((shapes: Shape$v1[]) => {
      let mapGeometries = this.getMapGeometries(mapCont.mapComm.mapContextId);
      if (mapGeometries?.length) {
        const ids = mapGeometries.map(g => g.id);
        mapCont.mapDataRequest.removeGeometries(ids);

        // clean up context listener
        ids.forEach(id => {
          const sub = this.geometryEvents.get(id);
          if (sub) {
            sub.unsubscribe();
            this.geometryEvents.delete(id);
          }
        });
      }

      mapGeometries = shapes.map(s => s.toMapGeometry$v1(capabilityId));
      this.mapGeometries.set(mapCont.mapComm.mapContextId, mapGeometries);

      this.initContextMenu(mapGeometries, mapCont.mapComm.mapContextId);

      mapCont.mapDataRequest.upsertGeometries(mapGeometries);
    });
  }

  private initContextMenu(geometries: Geometry$v1[], contextId: string, filterId: string = null): void {
    // Add context menu
    geometries.forEach(g => {
      const useAsFilter = new GeometryContextMenuItem$v1({
        id: ContextMenuActions.useAsFilter,
        label: this.tTokens.useAsFilter
      });

      const clearFilter = new GeometryContextMenuItem$v1({
        id: ContextMenuActions.clearFilter,
        label: this.tTokens.clearFilter
      });

      const editSmartShape = new GeometryContextMenuItem$v1({
        id: ContextMenuActions.editSmartShape,
        label: this.tTokens.editSmartShape
      });

      const createChannel = new GeometryContextMenuItem$v1({
        id: ContextMenuActions.createChannel,
        label: this.tTokens.createChannel
      });

      const subMenu: GeometryContextMenuItem$v1[] = [];

      if (filterId === g.sourceId) {
        subMenu.push(clearFilter);
      } else {
        subMenu.push(useAsFilter);
      }

      const foundShape = this.shapeStore.snapshot(g.sourceId);
      if (!foundShape?.isManaged && this.activeTenantId === foundShape?.tenantId) {
        subMenu.push(editSmartShape);
      }

      subMenu.push(createChannel);

      // Create parent menu item
      const shapeMenu = new GeometryContextMenuItem$v1({
        id: ContextMenuActions.shapeMenu,
        label: this.tTokens.shapeActions,
        submenuItems: subMenu
      });

      g.setContextMenu([shapeMenu]);

      // Clean up event listeners if needed
      const sub = this.geometryEvents.get(g.id);
      if (sub) {
        sub.unsubscribe();
        this.geometryEvents.delete(g.id);
      }

      this.geometryEvents.set(g.id, g.events.contextMenuItemClicked$.subscribe(item => {
        switch (item.id) {
          case ContextMenuActions.useAsFilter:
            this.useAsFilter(g, contextId);
            break;
          case ContextMenuActions.clearFilter:
            this.clearFilter(contextId);
            break;
          case ContextMenuActions.editSmartShape:
            this.startEditShape(this.shapeStore.snapshot(g.sourceId));
            break;
          case ContextMenuActions.createChannel:
            const shape = this.shapeStore.snapshot(g.sourceId);
            this.conversationAdapter.startNewChannel(
              capabilityId,
              shape.id,
              shape.name,
              new Location$v1({
                coordinates: shape.toMapGeometry$v1(capabilityId).centroid()
              } as Location$v1),
              shape.tenantId
            );
            break;
        }
      }));
    });
  }

  /**
   * Use this shape as a smart filter
   */
  private useAsFilter(g: Geometry$v1, contextId): void {
    this.actionSrv.shapeFilter(contextId, {
      sourceId: g.sourceId,
      radius: g.radius,
      type: g.type,
      coordinates: g.coordinates,
      originId: contextId
    } as ShapeFilter$v1);
  }

  /**
   * Clears any active filters
   */
  private clearFilter(contextId: string): void {
    this.actionSrv.shapeFilter(contextId, {
      originId: contextId
    } as ShapeFilter$v1);
  }

  /**
   * Start edit shape
   */
  startEditShape(shape: Shape$v1): void {
    this.dialog.open(CreateEditComponent, {
      height: '90%',
      width: '90%',
      data: shape,
      disableClose: true
    }).afterClosed().subscribe(shape => {
      if (shape) {
        this.dataSrv.update$(shape).toPromise()
          .catch(err => {
            this.dialog.open(CommonErrorDialogComponent, {
              data: {
                message: JSON.parse(err?.errors[0])?.errors[0]
              }
            });
          });
      }
      this.detectChanges();
    });

    this.detectChanges();
  }

  private listenToFilterChangeEvent(mapCont: MapController): void {
    if (mapCont.mapComm.mapContextId) {
      this.actionSrv.filter$(mapCont.mapComm.mapContextId).pipe(
        startWith(null as FilterActionData$v1)
      ).subscribe(basicFilter => {
        this.addShapesToMap(mapCont, basicFilter?.filter);
      });
    }
  }

  private listenToStoreEvents(mapCont: MapController) {
    const subs = [];

    if (!mapCont.shapeIds$) {
      // Deletes
      const removeSub = this.shapeStore.removed$.pipe(
        filter(item => !!item)
      ).subscribe(id => {
        let mapGeometries = this.getMapGeometries(mapCont.mapComm.mapContextId);
        const deleteId = mapGeometries.find(g => g.sourceId === id)?.id;
        mapGeometries = mapGeometries.filter((g => {
          return !(g.sourceId === id);
        }));

        this.mapGeometries.set(mapCont.mapComm.mapContextId, mapGeometries);

        const event = this.geometryEvents.get(deleteId);
        if (event) {
          event.unsubscribe();
          this.geometryEvents.delete(deleteId);
        }
        if (deleteId) {
          mapCont.mapDataRequest.removeGeometries([deleteId]);
        }
      });

      subs.push(removeSub);
    }

    // Creates
    const createSub = this.shapeStore.upserted$.pipe(
      filter(changes => !!changes?.inserts?.length),
      map(changes => changes?.inserts)
    ).subscribe(async shapes => {


      // Filter out shapes that don't pass the filter
      let shapeList = [];
      for (const shape of shapes) {
        const passFilters = await this.filterCheckAsync(shape, mapCont.mapComm.mapContextId);
        if (passFilters && !shape.tombstoned) {
          shapeList.push(shape);
        }
      }

      // Add shapes to map
      const newGeometries = shapeList.map(s => s.toMapGeometry$v1(capabilityId));
      let mapGeometries = this.getMapGeometries(mapCont.mapComm.mapContextId);
      mapGeometries = mapGeometries.concat(newGeometries);
      this.mapGeometries.set(mapCont.mapComm.mapContextId, mapGeometries);

      // Update context menu
      this.initContextMenu(newGeometries, mapCont.mapComm.mapContextId);

      mapCont.mapDataRequest.upsertGeometries(newGeometries);

    });

    subs.push(createSub);

    // Updates
    const updateSub = this.shapeStore.upserted$.pipe(
      filter(changes => !!changes.updates?.length),
      map(changes => changes.updates)
    ).subscribe(async shapes => {

      // If this a channel map, check to see if we have added this asset to the map.  If not add it.
      if (mapCont.shapeIds$) {;
        mapCont.mapDataRequest.clearGeometries();

        mapCont.shapeIds$.pipe(first()).subscribe(ids => {
          const list = [];
          ids.forEach(id => {
            list.push(this.shapeStore.snapshot(id));
          });
          mapCont.mapDataRequest.upsertGeometries(list.map(s => s.toMapGeometry$v1(capabilityId)));
        });

      } else {
        // Filter out shapes that don't pass the filter
        let shapeList = [];
        for (const shape of shapes) {
          const passFilters = await this.filterCheckAsync(shape, mapCont.mapComm.mapContextId);
          if (passFilters) {
            shapeList.push(shape);
          }

          // Update any shape filters
          this.actionSrv.shapeFilter$(mapCont.mapComm.mapContextId).pipe(first()).subscribe(filter => {
            if (filter?.sourceId === shape.id && !shape.tombstoned) {
              // Update the filter
              this.useAsFilter(shape.toMapGeometry$v1(capabilityId), mapCont.mapComm.mapContextId);
            }
          });
        }

        let removeIds = [];
        let mapGeometries = this.getMapGeometries(mapCont.mapComm.mapContextId);

        mapGeometries = mapGeometries.filter((g => {
          const remove = shapeList.some(shape => {
            return shape.id === g.sourceId;
          });

          if (remove) {
            removeIds.push(g.id);

            // Clean up context event
            const event = this.geometryEvents.get(g.id);
            if (event) {
              event.unsubscribe();
              this.geometryEvents.delete(g.id);
            }
          }
          return !remove;
        }));

        mapCont.mapDataRequest.removeGeometries(removeIds);

        const updatedGeometries = shapeList.filter(s => !s.tombstoned)
          .map(s => s.toMapGeometry$v1(capabilityId));
        mapGeometries = mapGeometries.concat(updatedGeometries);

        this.mapGeometries.set(mapCont.mapComm.mapContextId, mapGeometries);

        // Update context menu
        this.initContextMenu(updatedGeometries, mapCont.mapComm.mapContextId);

        mapCont.mapDataRequest.upsertGeometries(updatedGeometries);
      }
    });

    subs.push(updateSub);
    this.storeEvents.set(mapCont.mapComm.mapContextId, subs);
  }

  /**
   * Manually add a map to the map service for channel
   */
  addMapForChannels(mapComm: MapCommunication$v1, shapeIds$: Observable<string[]>) {
    const index = this.mapControllers.findIndex((cont) => {
      return (cont.mapComm.mapId === mapComm.mapId);
    });
    if (index !== -1) {
      this.removeMapForChannels(mapComm);
    }

    const mapCont = new MapController({
      mapComm: mapComm,
      shapeIds$: shapeIds$
    });

    this.mapControllers.push(mapCont);

    mapComm.mapEvents.mapDataRequest$.pipe(
      filter((mapDataRequest) => mapDataRequest && mapDataRequest.capabilityId === capabilityId),
      takeUntil(mapCont.mapDestroyed$)
    ).subscribe((mapDataRequest) => {
      mapCont.mapDataRequest = mapDataRequest;

      // Check to see if displaying list of shapes or all data on the channels map.
      if (shapeIds$) {
        this.setupMapLayerForChannels(mapCont);
        this.listenToShapeIdChanges(mapCont);

      } else {
        this.handleMapDataRequest(mapCont);
      }
    });

    mapComm.mapEvents.mapCommunicationClosed$.pipe(
      filter(item => !!item)
    ).subscribe(() => {
      const idx = this.mapControllers.findIndex((cont) => {
        return (cont.mapComm.mapId === mapComm.mapId);
      });
      if (idx !== -1) {
        const temp = this.mapControllers[idx];
        temp.mapDestroyed$.next();
        temp.mapDestroyed$.complete();
        temp.shapeIds$ = null;
        this.mapControllers.splice(idx, 1);
      }
    });

  }

  /**
   * Manually remove a map from channel
   */
  removeMapForChannels(mapComm: MapCommunication$v1) {
    const index = this.mapControllers.findIndex((mapCont) => {
      return (mapCont.mapComm.mapId === mapComm.mapId);
    });

    if (index !== -1) {
      const mapCont = this.mapControllers[index];
      if (mapCont.clearStoreEvents$) {
        mapCont.clearStoreEvents$.next();
        mapCont.clearStoreEvents$.complete();
        mapCont.clearStoreEvents$ = null;
      }

      mapCont.mapDataRequest.clearGeometries();

      mapCont.mapDestroyed$.next();
      mapCont.mapDestroyed$.complete();
      mapCont.shapeIds$ = null;
      this.mapControllers.splice(index, 1);
    }
  }

  private listenToShapeIdChanges(mapCont: MapController) {
    if (mapCont.shapeIdsRef$) {
      mapCont.shapeIdsRef$.unsubscribe();
      mapCont.shapeIdsRef$ = null;
    }

    mapCont.shapeIdsRef$ = mapCont.shapeIds$.pipe(
      filter(item => !!item),
      takeUntil(mapCont.mapDestroyed$)
    ).subscribe(async (shapeIds: string[]) => {
      // Stop listening to store events
      if (mapCont.clearStoreEvents$) {
        mapCont.clearStoreEvents$.next();
        mapCont.clearStoreEvents$.complete();
        mapCont.clearStoreEvents$ = null;
      }

      mapCont.clearStoreEvents$ = new Subject<null>();

      // Used to signal the store listener when to start processing store events
      const dataLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
      this.listenToStoreEvents(mapCont) //, dataLoaded$);
      mapCont.mapDataRequest.clearGeometries();
      const mapGeometries = [];
      for (const id of shapeIds) {
        const shape = this.shapeStore.snapshot(id);
        if (shape) {
          mapGeometries.push(shape.toMapGeometry$v1(capabilityId));
        } else {
          mapCont.missingIds.push(id);
        }
      }

      if (mapGeometries.length) {
        mapCont.mapDataRequest.upsertGeometries(mapGeometries);
      }

      // Or maybe add shape here
      // Start listening to store events
      dataLoaded$.next(true);
    });
  }

  /**
   * Load the initial data to the channel map
   */
  private setupMapLayerForChannels(mapCont: MapController) {
    this.listenToSelectionChangeEvent(mapCont);
    this.listenToFilterChangeEvent(mapCont);
  }

  /**
   * Returns true if shape passes filter check
   */
  private async filterCheckAsync(shape: Shape$v1, contextId: string): Promise<boolean> {
    // Check if passes basic filter

    let passBasicFilter = true;
    const basicFilter = (await this.actionSrv.filter$(contextId).pipe(first()).toPromise());

    if (basicFilter?.filter) {
      passBasicFilter = !!basicFilter.filter.apply([shape]).length;
    }

    return passBasicFilter;
  }

  /**
   * Listen for shape selection change event
   */
  private listenToSelectionChangeEvent(mapCont: MapController) {
    if (mapCont.mapComm.mapContextId) {
      this.actionSrv.multiselect$(mapCont.mapComm.mapContextId).subscribe((data) => {
        // Can only zoom to one geo at a time
        if (data && data?.items?.length === 1) {
          // Zoom to geo
          let mapGeometries = this.getMapGeometries(mapCont.mapComm.mapContextId);
          const geometry = mapGeometries.find(g => g.sourceId === data.items[0].entityId);
          if (geometry) {
            mapCont.mapComm.zoomToGeometry(geometry, null);
          }
        }
      });

    }
  }

  /**
   * Initialize localization
   */
  private async intLocalization(): Promise<void> {
    this.tTokens.clearFilter = await this.localizationAdapter.getTranslationAsync(MapTranslationTokens.clearFilter);
    this.tTokens.editSmartShape = await this.localizationAdapter.getTranslationAsync(MapTranslationTokens.editSmartShape);
    this.tTokens.useAsFilter = await this.localizationAdapter.getTranslationAsync(MapTranslationTokens.useAsFilter);
    this.tTokens.createChannel = await this.localizationAdapter.getTranslationAsync(MapTranslationTokens.createChannel);
    this.tTokens.shapeActions = await this.localizationAdapter.getTranslationAsync(MapTranslationTokens.shapeActions);
  }

  /**
   * Detect changes
   */
  private detectChanges(): void {
    try {
      this.ref?.tick();
    } catch (err) { }
  }

  /**
   * Returns a list of map geometries for a given context id
   * @param contextId Map context ID
   * @returns List of geometries
   */
  private getMapGeometries(contextId: string): Geometry$v1[] {
    if (this.mapGeometries.has(contextId)) {
      return this.mapGeometries.get(contextId);
    } else {
      return [];
    }
  }

}
