import { AfterViewInit, Component } from '@angular/core';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Geometry$v1, LayerPanelControlPositions$v1, ZoomControlPositions$v1 } from '@galileo/web_commonmap/adapter';
import { FilterCriteriaEditorSettings, RestrictionGrouping$v1 } from '@galileo/web_commontenant/adapter';
import {
  InjectableComponentNames,
  Shape$v1,
  ShapeCoordinates$v1,
  ShapeFillPattern$v1,
  ShapeFillType$v1,
  ShapeGraphicsSettings$v1,
} from '@galileo/web_shapes/_common';
import { capabilityId, ShapesAdapterService$v1 } from '@galileo/web_shapes/adapter';
import { from, Subject } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  /** Stream of custom overlays */
  customOverlays$ = from(this.layoutCompilerSrv.getCustomOverlaysAsync()).pipe(
    mergeMap(data => data),
    tap((data) => console.info(data))
  );

  constructor(
    private layoutCompilerSrv: LayoutCompilerAdapterService,
    private localizationAdapter: CommonlocalizationAdapterService$v1,
    private shapeAdapter: ShapesAdapterService$v1
  ) {

    this.localizationAdapter.changeLanguageAsync('en');
    this.layoutCompilerSrv.loadCapabilityCoreAsync(capabilityId);

    // this.createAbstractions();

    const startGeo = new Geometry$v1({
      coordinates: [
        [[-86.969147,34.535975,0],[-86.969147,34.786739,0],[-86.421204,34.786739,0],[-86.421204,34.535975,0],[-86.969147,34.535975,0]]
      ] as any
    } as Geometry$v1)

    // this.shapeAdapter.startCreateShapeAsync(startGeo).then(shape => {
    //   console.info('Shape created', shape);
    // }).catch(() => {
    //   console.info('Shape creation failed!');
    // });

  }

  ngAfterViewInit(): void {
    // this.injectAssetListComponentAsync();
    // this.injectShapeManagerAsync();
    this.injectListComponentAsync();
    // this.injectListSettingsComponentAsync();
    // this.injectDataSharingAsync();
    // this.iconTest();
  }

  useAsFilter(): void {
    const startGeo = new Geometry$v1({
      coordinates: [
        [[-86.969147,34.535975,0],[-86.969147,35.786739,0],[-86.421204,34.786739,0],[-86.421204,34.535975,0],[-86.969147,34.535975,0]]
      ] as any
    } as Geometry$v1)

    this.shapeAdapter.useAsShapeFilterAsync(startGeo, 'workspaceId;screenId;tabId;map-a').then(() => {
      console.info('shape filter done');
    });
  }

  /**
   * Creates the different abstractions and consoles them out
   */
  private createAbstractions(): void {
    const graphicsSettings = new ShapeGraphicsSettings$v1({
      fillColor: '000',
      fillPattern: ShapeFillPattern$v1.hatch1,
      fillType: ShapeFillType$v1.pattern,
      fillOpacity: 0,
    } as ShapeGraphicsSettings$v1);
    const shapeA = new Shape$v1({
      graphicsSettings: graphicsSettings,
      coordinates: [
        {
          mainShape: [
            [
              85.078125,
              53.48804553605622
            ],
            [
              74.091796875,
              47.517200697839414
            ],
            [
              90.966796875,
              38.20365531807149
            ],
            [
              112.67578124999999,
              46.49839225859763
            ],
            [
              101.162109375,
              61.938950426660604
            ],
            [
              85.078125,
              53.48804553605622
            ]
          ]
        } as ShapeCoordinates$v1
      ]
    } as Shape$v1);
    const shapeB = new Shape$v1({ ...shapeA, id: '123456' } as Shape$v1);
    console.info('Start shapeA', shapeA);
    console.info('Start shapeB', shapeB);

    shapeA.graphicsSettings.fillColor = 'fff'
    shapeA.graphicsSettings.fillPattern = ShapeFillPattern$v1.stripes1;
    shapeA.coordinates[0].mainShape[2] = [0, 0];

    console.info('End shapeA', shapeA);
    console.info('End shapeB', shapeB);

  }

  private async injectListComponentAsync(): Promise<void> {
    await this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
      '@hxgn/shapes/list/v1',
      '@hxgn/shapes', '#shape-list', {
      sortBy: 'nameAsc',
      enableCardExpansion: true,
      enableKeywords: true,
      enablePortalFormatting: false,
      searchString: '',
      headerTitle: 'Shapes List',
      contextId: 'workspaceId;screenId;tabId;list-a',
      customHeaderId: 'customHeader_abc-123'
    }, 'workspaceId;screenId;tabId;list-a');

    await this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
      '@hxgn/commonmap/mapview/v1',
      '@hxgn/commonmap', '#map', {
      headerTitle: 'Map List',
      contextId: 'workspaceId;screenId;tabId;map-a',
      customHeaderId: 'customHeader_abc-1234',
      mapSetup: {
        mapPresetId: '55276344-000D-42A8-8321-9A19762A26D1',
        displayZoomControl: true,
        zoomControlLocation: ZoomControlPositions$v1.BottomRight,
        zoomLevel: -1,
        mapCenter: null
      },
      layerPanel: {
        lockMapAndLayers: false,
        displayLayerPanel: true,
        layerPanelLocation: LayerPanelControlPositions$v1.TopRight,
        allowLayerReorder: true,
      },
      mapControls: {
        showDrawControl: true
      }
    }, 'workspaceId;screenId;tabId;map-a');

    await this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
      '@hxgn/commonmap/mapview/v1',
      '@hxgn/commonmap', '#maptest', {
      headerTitle: 'Map List',
      contextId: 'workspaceId;screenId;tabId;map-b',
      customHeaderId: 'customHeader_abc-1234',
      mapSetup: {
        mapPresetId: '55276344-000D-42A8-8321-9A19762A26D1',
        displayZoomControl: true,
        zoomControlLocation: ZoomControlPositions$v1.BottomRight,
        zoomLevel: -1,
        mapCenter: null
      },
      layerPanel: {
        lockMapAndLayers: false,
        displayLayerPanel: true,
        layerPanelLocation: LayerPanelControlPositions$v1.TopRight,
        allowLayerReorder: true,
      },
      mapControls: {
        showDrawControl: true
      }
    }, 'workspaceId;screenId;tabId;map-b');
  }

  private async injectListSettingsComponentAsync(): Promise<void> {
    await this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
      '@hxgn/shapes/list/settings/v1',
      '@hxgn/shapes', '#shape-list-settings', {
      sortBy: 'timeAsc',
      enableCardExpansion: true,
      enableKeywords: true,
      enablePortalFormatting: false,
      searchString: '',
      headerTitle: 'Shapes List',
      contextId: 'workspaceId;screenId;tabId;list-a',
      customHeaderId: 'customHeader_abc-123',
      viewSettings: {

      }
    }, 'workspaceId;screenId;tabId;list-a');

  }

  private async injectAssetListComponentAsync(): Promise<void> {

    await this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
      '@hxgn/assets/list/v1',
      '@hxgn/assets', '#asset-list', {
      sortBy: 'timeAsc',
      enableCardExpansion: true,
      enableKeywords: true,
      enablePortalFormatting: false,
      headerTitle: 'Asset List',
      contextId: 'workspaceId;screenId;tabId;list-a',
      customHeaderId: 'customHeader_abc-123'
    }, 'workspaceId;screenId;tabId;list-a');

    await this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
      '@hxgn/commonmap/mapview/v1',
      '@hxgn/commonmap', '#map', {
      headerTitle: 'Map List',
      contextId: 'workspaceId;screenId;tabId;map-a',
      customHeaderId: 'customHeader_abc-1234',
      mapSetup: {
        mapPresetId: '55276344-000D-42A8-8321-9A19762A26D1',
        displayZoomControl: true,
        zoomControlLocation: ZoomControlPositions$v1.BottomRight,
        zoomLevel: -1,
        mapCenter: null
      },
      layerPanel: {
        lockMapAndLayers: false,
        displayLayerPanel: true,
        layerPanelLocation: LayerPanelControlPositions$v1.TopRight,
        allowLayerReorder: true,
      },
      mapControls: {
        showDrawControl: true
      }
    }, 'workspaceId;screenId;tabId;map-a');

    await this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
      '@hxgn/commonmap/mapview/v1',
      '@hxgn/commonmap', '#map-b', {
      headerTitle: 'Map List',
      contextId: 'workspaceId;screenId;tabId;map-a',
      customHeaderId: 'customHeader_abc-1234',
      mapSetup: {
        mapPresetId: '55276344-000D-42A8-8321-9A19762A26D1',
        displayZoomControl: true,
        zoomControlLocation: ZoomControlPositions$v1.BottomRight,
        zoomLevel: -1,
        mapCenter: null
      },
      layerPanel: {
        lockMapAndLayers: false,
        displayLayerPanel: true,
        layerPanelLocation: LayerPanelControlPositions$v1.TopRight,
        allowLayerReorder: true,
      },
      mapControls: {
        showDrawControl: true
      }
    }, 'workspaceId;screenId;tabId;map-b');
  }

  private async injectShapeManagerAsync() {
    const adminId = '@hxgn/shapes/admin/shape-manager';
    await this.layoutCompilerSrv.loadCapabilityCoreAsync(adminId);
    this.layoutCompilerSrv.delegateInjectComponentPortalAsync('@hxgn/shapes/admin/shape-manager/v1', adminId, '#admin-shape-manager', null);
  }

  private async injectDataSharingAsync() {
    const dataSharingSettings: FilterCriteriaEditorSettings = {
      editableFilterCriteria: [],
      filterNotify$: new Subject<RestrictionGrouping$v1<any, any>[]>(),
      editableRedactionCriteria: [],
      redactionNotify$: new Subject<RestrictionGrouping$v1<any, any>[]>(),
      readOnlyRedactionCriteria: [],
      readOnlyFilterCriteria: [],
      isOverride: true
    };

    this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
      InjectableComponentNames.createDataSharingComponent,
      capabilityId, '#data-sharing', dataSharingSettings, 'dataSharing'
    );
  }

  private iconTest(): void {
    this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
      InjectableComponentNames.iconComponent,
      capabilityId, `#icon-test`, 'af2c89e5-c720-4273-a4fb-f892d358a928'
    );
  }
}
