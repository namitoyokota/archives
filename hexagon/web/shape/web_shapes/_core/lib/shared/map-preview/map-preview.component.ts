import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { LineType$v1 } from '@galileo/web_common-libraries/graphical/line-type';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import {
  Geometry$v1,
  LayerCollection$v1,
  LayerFormat$v1,
  MapCommunication$v1,
  MapDrawSetup$v1,
  MapLayer$v1,
  MapSettings$v1,
  PixelPoint$v1,
  Point$v1,
  VectorStyleProperties$v1,
} from '@galileo/web_commonmap/adapter';
import { MapData$v1, Tenant$v1 } from '@galileo/web_commontenant/adapter';
import { capabilityId, Shape$v1, ShapeGraphicsSettings$v1 } from '@galileo/web_shapes/_common';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { filter, first, takeUntil } from 'rxjs/operators';

import { MapPreviewTranslatedTokens, MapPreviewTranslationTokens } from './map-preview.translation';

@Component({
  selector: 'hxgn-shapes-map-preview',
  templateUrl: 'map-preview.component.html',
  styleUrls: ['map-preview.component.scss']
})

export class MapPreviewComponent implements OnInit, OnDestroy {

  /** The active tenant */
  @Input() tenant: Tenant$v1;

  /** The shape being edited */
  @Input('shape')
  set setShape(shape: Shape$v1) {
    // If shape is the same don't do anything
    if (shape && this.activeShape && shape.id === this.activeShape.id &&
      this.activeShape.isCoordinatesEqual(shape.coordinates) && !shape.isManaged &&
      this.activeShape.radius === shape.radius) {

      this.activeShape = new Shape$v1(shape);
      this.setStyle(shape.graphicsSettings);

      return;
    } else if (shape?.isManaged) {
      this.activeShape = new Shape$v1(shape);
      // Don't allow managed shapes to be edited
      this.mapComm?.draw?.deactivate();
      this.showDrawToolBar = false;

      if (this.geometrySub) {
        this.geometrySub.unsubscribe();
        this.geometrySub = null;
      }

      this.mapComm?.draw?.clear();

      if (!this.readOnlyLayer) {
        // Create the geometry layer that will hold the polygon geometry for the shape filter
        let layerColl = new LayerCollection$v1({ name: 'ReadOnlySmartShape' });
        this.readOnlyLayer = new MapLayer$v1({ name: 'ReadOnlySmartShape', format: LayerFormat$v1.Geometry });

        // Add layer collection to the map
        layerColl.addLayers([this.readOnlyLayer]);
        layerColl = this.mapComm.layers.addLayerCollection(layerColl);
      }

      this.readOnlyLayer.clearAllGeometries();
      const g = shape.toMapGeometry$v1(capabilityId);
      this.readOnlyLayer.upsertGeometries([g ]);

      this.mapComm.zoomToGeometry(g, null);

      return;

    } else if (!shape) {
      // No shape is selected hide the draw toolbar
      this.mapComm?.draw?.deactivate();
      this.showDrawToolBar = false;
      this.activeShape = null;

      if (this.geometrySub) {
        this.geometrySub.unsubscribe();
        this.geometrySub = null;
      }

      return;
    }

    if (this.readOnlyLayer) {
      this.readOnlyLayer.clearAllGeometries();
    }

    this.activeShape = new Shape$v1(shape);
    this.setStyle(shape.graphicsSettings);

    this.mapIsReady$.pipe(
      filter(isReady => isReady),
      first()
    ).subscribe(() => {
      let mapGeometry: Geometry$v1

      if (shape.coordinates.length) {
        mapGeometry = shape.toMapGeometry$v1(this.adminCapabilityId);
      }

      this.skipUpdate = true;

      this.mapComm?.draw?.clear();

      // Only activate if the draw toolbar is not shown
      if (!this.showDrawToolBar) {

        if (!this.geometrySub) {
          this.mapReady(this.mapComm);

        }

        this.mapComm?.draw?.activate(
          this.adminCapabilityId,
          new MapDrawSetup$v1({
            drawToolbarTitle: this.tTokens.drawEditShapes,
            persistentEdit: true,
            initialGeometry: mapGeometry
          })
        );

        this.showDrawToolBar = true;

      }

      if (mapGeometry) {
        this.mapComm?.draw?.edit(mapGeometry, true, new PixelPoint$v1(40, 40));

      }
    });
  }

  /** Event when a shape has been updated */
  @Output() shapeUpdated = new EventEmitter<Shape$v1>();

  /** Event when the map is Ready */
  @Output() mapIsReady = new EventEmitter<boolean>();

  /** Active shape that is being drawn */
  activeShape: Shape$v1;

  /** Settings to control the display of the map */
  mapSettings: MapSettings$v1;

  /** Expose MapPreviewTranslationTokens to HTML */
  tokens: typeof MapPreviewTranslationTokens = MapPreviewTranslationTokens;

  /** Translated tokens */
  tTokens: MapPreviewTranslatedTokens = {} as MapPreviewTranslatedTokens;

  private readOnlyLayer: MapLayer$v1;

  private showDrawToolBar = false;

  private mapComm: MapCommunication$v1;

  private readonly adminCapabilityId = `${capabilityId}/admin/shape-manager`;

  private readonly mapIsReady$ = new BehaviorSubject<boolean>(false);

  /** Flag used to skip the update when a shape is made active */
  private skipUpdate = false;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  private geometrySub: Subscription;

  constructor(private localizationAdapter: CommonlocalizationAdapterService$v1) { }

  /**
   * On init lifecycle hook
   */
  ngOnInit(): void {
    this.initLocalizationAsync();

    this.mapSettings = new MapSettings$v1();
    this.mapSettings.mapControls.displayLayerPanel = false;
    this.mapSettings.mapControls.showDrawControl = false;

    if (this.tenant) {
      const mapData = new MapData$v1(this.tenant.mapData);
      if (mapData.centerLatitude && mapData.centerLongitude && mapData.zoomLevel) {
        const lat = parseFloat(mapData.centerLatitude);
        const lng = parseFloat(mapData.centerLongitude);
        const alt = 0;
        if (lat && lng) {
          this.mapSettings.mapCenter = new Point$v1(lat, lng, alt);
        }
        const zoomLevel = parseInt(mapData.zoomLevel, 10);
        if (zoomLevel) {
          this.mapSettings.zoomLevel = zoomLevel;
        }
      }
    }

    this.localizationAdapter.adapterEvents.languageChanged$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((lang) => {
      this.initLocalizationAsync();
    });
  }

  /** On destroy life cycle hook */
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();

    if (this.geometrySub) {
      this.geometrySub.unsubscribe();
      this.geometrySub = null;
    }
  }

  /**
   * Map init is complete
   */
  mapReady(mapComm: MapCommunication$v1): void {
    this.mapComm = mapComm;

    this.mapComm?.draw?.activate(
      this.adminCapabilityId,
      new MapDrawSetup$v1({
        drawToolbarTitle: this.tTokens.drawEditShapes,
        persistentEdit: false
      }));

    this.geometrySub = this.mapComm?.draw?.geometry$.subscribe(g => {
      if (g?.coordinates) {
        const updatedShape = this.activeShape.fromGeometry$v1(g);

        this.activeShape = updatedShape;
        this.shapeUpdated.emit(updatedShape);


      } else if (!g && this.activeShape) {
        // Manually clear coordinates
        this.activeShape = new Shape$v1({
          ...this.activeShape,
          shapeType: null,
          coordinates: []
        } as Shape$v1);

        if (this.skipUpdate) {
          this.skipUpdate = false;
        } else {
          this.shapeUpdated.emit(this.activeShape);
        }

      }
    });

    this.mapIsReady$.next(true);
    this.mapIsReady.emit(true);
  }

  /**
   * Sets the shapes being drawn graphical settings
   * @param settings The graphic settings to use
   */
  private setStyle(settings: ShapeGraphicsSettings$v1): void {
    // Set the style when the map is ready
    this.mapIsReady$.pipe(
      filter(isReady => isReady),
      first()
    ).subscribe(() => {
      this.mapComm?.draw.setStyle(new VectorStyleProperties$v1({
        lineColor: settings?.lineColor,
        lineWidth: settings?.lineWeight,
        fillColor: settings?.fillColor,
        linePattern: settings?.lineType?.toString() as LineType$v1
      }));
    });
  }

  /**
    * Set up routine for localization
    */
  private async initLocalizationAsync(): Promise<void> {
    const tokens: string[] = Object.keys(MapPreviewTranslationTokens).map(k => MapPreviewTranslationTokens[k]);
    const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);
    this.tTokens.drawEditShapes = translatedTokens[MapPreviewTranslationTokens.drawEditShapes];
  }
}
