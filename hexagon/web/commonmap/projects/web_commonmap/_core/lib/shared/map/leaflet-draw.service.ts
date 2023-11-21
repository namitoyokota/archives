import '@galileo/leaflet-draw';

import { ChangeDetectorRef, Injectable } from '@angular/core';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import {
    Draw,
    Geometry$v1,
    GeometryType$v1,
    MapInterface$v1,
    PixelPoint$v1,
    VectorStyleProperties$v1,
} from '@galileo/web_commonmap/_common';
import { buffer as Buffer } from '@turf/turf';
import * as L from 'leaflet';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, first, takeUntil } from 'rxjs/operators';

import { CommonmapCoreService$v1 } from '../../commonmap-core.service';
import { DrawToolbarTranslatedTokens, DrawToolbarTranslationTokens } from './draw-toolbar/draw-toolbar.translation';

export enum DrawMode {
    Draw = 'Draw',
    Display = 'Display'
}

@Injectable()
export class LeafletDrawService implements Draw {

    /** Current geometry */
    private readonly geometry = new BehaviorSubject<Geometry$v1>(null);

    /** Current geometry */
    geometry$: Observable<Geometry$v1>;

    /** Shape capability id */
    capabilityId: string;

    /** List of geometry changes */
    private geometryHistory: Geometry$v1[] = [];

    /** Where in the history list the undo is at */
    private historyPointer = -1;

    /** Flag to indicate whether undo can be operated */
    private readonly canUndo = new BehaviorSubject<boolean>(false);

    /** Flag to indicate whether undo can be operated */
    canUndo$: Observable<boolean>;

    /** Flag to indicate whether redo can be operated */
    private readonly canRedo = new BehaviorSubject<boolean>(false);

    /** Flag to indicate whether redo can be operated */
    canRedo$: Observable<boolean>;

    /** Flag to indicate whether mask is being displayed */
    private readonly maskShown = new BehaviorSubject<boolean>(false);

    /** Flag to indicate whether mask is being displayed */
    maskShown$: Observable<boolean>;

    /** Event when radius changes */
    private readonly radiusChange = new BehaviorSubject<number>(null);

    /** Event when radius changes */
    radiusChange$ = this.radiusChange.asObservable();

    /** Flag to indicate if draw automatically starts edit mode for drawn geometry */
    autoEdit = true;

    /** Leaflet map object */
    private map: L.Map;

    /** Flag to indicate whether drawing is ready */
    private isReady$ = new BehaviorSubject<boolean>(false);

    /** The shape that is being drawn */
    private drawing: L.Draw.Circle | L.Draw.Polygon | L.Draw.Rectangle | L.Draw.Polyline;

    /** Stores last drawn geometry to store buffer layer */
    private lastDrawnGeometry: Geometry$v1;

    /** Stores mask layer that was last drawn (used for undo) */
    private lastDrawnShapeLayer: any;

    /** Filter mask */
    private maskShapeLayer: any;

    /** Filter mask options */
    private maskOptions: any;

    /** Editor for when shape has been created */
    private drawEditor: L.Draw.EditDraw;

    /** Tracks number of vertices while drawing a polygon/polyline */
    private drawingVertices = 0;

    /** List of deleted vertices. Coordinates are only added when undo is clicked while drawing a polygon/polyline.*/
    private deletedVertices: L.LatLng[] = [];

    /** Layer group to add/remove leaflet layers */
    private featGroup: L.FeatureGroup;

    /** Pane name for layer */
    private paneName: string;

    /** Pane name for mask layer */
    private maskPaneName: string;

    /** Draw mask layer */
    private drawMask: L.LayerGroup;

    /** Indicate whether to delete shape on undo */
    private deleteOnUndoComplete = true;

    /** Current shape being created/edited */
    private currentShape: GeometryType$v1;

    /** Default style used for displaying shape */
    private defaultStyle: VectorStyleProperties$v1 = new VectorStyleProperties$v1({
        lineColor: '#62b4ff',
        lineWidth: 4,
        fillColor: null
    });

    /** Current style used for displaying shape */
    private currentStyle: VectorStyleProperties$v1;

    /** Leaflet options for styling */
    private leafletStyle: any;

    /**
     * A flag that is true if an geometry has been updated in edit mode
     * and the history of the change should be tracked
     */
    private geometryEditUpdate = false;

    /** Default radius of the mask buffer in meters */
    readonly defaultMaskBufferRadius = 2000;

    /** Current buffer radius used for masking line */
    private maskBufferRadius = this.defaultMaskBufferRadius;

    /** List of translated tokens. */
    private tTokens: DrawToolbarTranslatedTokens = {} as DrawToolbarTranslatedTokens;

    /** Destroy observable */
    private destroy$ = new Subject<boolean>();

    constructor(
        private localizationAdapter: CommonlocalizationAdapterService$v1,
        private mapCoreSvc: CommonmapCoreService$v1,
        private iMap: MapInterface$v1,
        private cdr: ChangeDetectorRef
    ) {
        this.maskShown$ = this.maskShown.asObservable();
    }

    /**
     * Sets the active map
     */
    async init(map: L.Map, paneName: string, maskPaneName: string, featGroup: L.FeatureGroup): Promise<void> {
        this.geometry$ = this.geometry.asObservable();
        this.canRedo$ = this.canRedo.asObservable();
        this.canUndo$ = this.canUndo.asObservable();

        this.map = map;
        this.featGroup = featGroup;
        this.paneName = paneName;
        this.maskPaneName = maskPaneName;

        this.currentStyle = this.defaultStyle;

        // Init map object
        // Init edit mode right away.
        this.drawEditor = new L.Draw.EditDraw(this.map as L.DrawMap, {
            featureGroup: this.featGroup
        } as L.ToolbarOptions);

        this.drawEditor.enable();

        // Listen for when a shape is created
        this.map.on(L.Draw.Event.CREATED, this.onGeometryCreated, this);
        this.map.on(L.Draw.Event.EDITED, this.onGeometryUpdated, this);

        this.map.on(L.Draw.Event.EDITMOVE, this.onGeometryUpdated, this);
        this.map.on(L.Draw.Event.EDITRESIZE, this.onGeometryUpdated, this);
        this.map.on(L.Draw.Event.EDITVERTEX, this.onGeometryUpdated, this);
        this.map.on(L.Draw.Event.DRAWVERTEX, this.drawPolyVertex, this);
        this.map.on(L.Draw.Event.RADIUSCHANGE, this.radiusUpdate, this);

        this.map.on('draw:undoableedit', this.onGeometryUpdated, this);

        await this.initLocalization();

        // Tooltips localization
        L.drawLocal.draw.handlers.polygon.tooltip.start = this.tTokens.clickToStartDrawing;
        L.drawLocal.draw.handlers.polygon.tooltip.cont = this.tTokens.clickToAddMorePoints;
        L.drawLocal.draw.handlers.polygon.tooltip.end = this.tTokens.clickTheFirstPointToFinish;

        L.drawLocal.draw.handlers.rectangle.tooltip.start = this.tTokens.clickAndDrag;
        L.drawLocal.draw.handlers.circle.tooltip.start = this.tTokens.clickAndDrag;
        L.drawLocal.draw.handlers.simpleshape.tooltip.end = this.tTokens.releaseToFinish;
        L.drawLocal.draw.handlers.polyline.error = this.tTokens.noIntersect;
        L.drawLocal.draw.handlers.polyline.deleteCoordError = this.tTokens.deleteWillIntersect;
        L.drawLocal.draw.handlers.polyline.tooltip.end = this.tTokens.doubleClickToFinish;

        this.mapCoreSvc.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(async (lang) => {
            await this.initLocalization();

            // Tooltips localization
            L.drawLocal.draw.handlers.polygon.tooltip.start = this.tTokens.clickToStartDrawing;
            L.drawLocal.draw.handlers.polygon.tooltip.cont = this.tTokens.clickToAddMorePoints;
            L.drawLocal.draw.handlers.polygon.tooltip.end = this.tTokens.clickTheFirstPointToFinish;

            L.drawLocal.draw.handlers.rectangle.tooltip.start = this.tTokens.clickAndDrag;
            L.drawLocal.draw.handlers.circle.tooltip.start = this.tTokens.clickAndDrag;
            L.drawLocal.draw.handlers.simpleshape.tooltip.end = this.tTokens.releaseToFinish;
            L.drawLocal.draw.handlers.polyline.error = this.tTokens.noIntersect;
            L.drawLocal.draw.handlers.polyline.tooltip.end = this.tTokens.doubleClickToFinish;
        });

        this.isReady$.next(true);
    }

    /**
     * Remove listeners
     */
    clearListeners() {
        if (this.map) {
            this.map.off(L.Draw.Event.CREATED, this.onGeometryCreated, this);
            this.map.off(L.Draw.Event.EDITED, this.onGeometryUpdated, this);
            this.map.off(L.Draw.Event.EDITMOVE, this.onGeometryUpdated, this);
            this.map.off(L.Draw.Event.EDITRESIZE, this.onGeometryUpdated, this);
            this.map.off(L.Draw.Event.EDITVERTEX, this.onGeometryUpdated, this);
            this.map.off(L.Draw.Event.DRAWVERTEX, this.drawPolyVertex, this);
            this.map.off(L.Draw.Event.RADIUSCHANGE, this.radiusUpdate, this);
            this.map.off('draw:undoableedit', this.onGeometryUpdated, this);
        }
    }

    /**
     * Cancels drawing
     */
    cancel(): void {
        if (this.drawing) {
            this.drawing.disable();
            this.drawing = null;
        }

        this.drawingVertices = 0;
        this.updateMaskBufferRadius();
        this.canRedo.next(false);
        this.canUndo.next(false);

        this.clearMask();
        this.delete();
        this.clearUndoHistory();
        this.deleteOnUndoComplete = true;

        this.radiusChange.next(null);
    }

    /**
     * Draws new shapa
     * @param shape Type of shape to draw
     */
    draw(shape: GeometryType$v1) {
        this.lastDrawnGeometry = null;
        this.currentShape = shape;

        this.isReady$.pipe(
            filter(isReady => isReady),
            first()
        ).subscribe(() => {
            this.leafletStyle = this.mapCoreSvc.convertVectorStylePropsToLeafletOptions(this.currentStyle);
            switch (shape) {
                case GeometryType$v1.circle:
                    this.drawing = new L.Draw.Circle(this.map as L.DrawMap, { shapeOptions: this.leafletStyle });
                    break;
                case GeometryType$v1.polygon:
                    this.drawing = new L.Draw.Polygon(this.map as L.DrawMap, { shapeOptions: this.leafletStyle });
                    break;
                case GeometryType$v1.line:
                    this.updateMaskBufferRadius();
                    this.leafletStyle.fill = false;
                    this.drawing = new L.Draw.Polyline(this.map as L.DrawMap, { shapeOptions: this.leafletStyle });
                    break;
                case GeometryType$v1.rectangle:
                default:
                    this.drawing = new L.Draw.Rectangle(this.map as L.DrawMap, { shapeOptions: this.leafletStyle });
                    break;
            }

            this.drawing.enable();
        });
    }

    /**
     * Create and display the given geometry on the map
     * @param g Geometry to display on the map
     * @param displayOptions Leaflet style used to display geometry
     */
    displayGeometry(g: Geometry$v1, displayOptions?: any): any {
        this.lastDrawnGeometry = g;

        if (g) {
            this.currentShape = g.type;
            const coords = g.type !== GeometryType$v1.circle && g.type !== GeometryType$v1.line ? g.coordinates[0] : g.coordinates;
            const radius = g.radius;
            const style = g.style ? g.style : new VectorStyleProperties$v1();
            this.leafletStyle = this.mapCoreSvc.convertVectorStylePropsToLeafletOptions(style, displayOptions.pane);

            const options = {
                shapeOptions: {...this.leafletStyle}
            };
            options.shapeOptions.bubblingMouseEvents = false;
            options.shapeOptions.contextmenu = true;
            options.shapeOptions.contextmenuItems = [];
            options.shapeOptions.fill = g.type !== GeometryType$v1.line;

            if (g.contextMenu?.length > 0) {
                for (const item of g.contextMenu) {
                    const menuItem: any = {
                        text: item.label,
                        icon: item.icon,
                        disabled: item.disabled,
                        index: 1,
                        submenuItems: null
                    }

                    if (item.submenuItems?.length > 0) {
                        menuItem.submenuItems = [];
                        for (const subItem of item.submenuItems) {
                            const submenuItem = {
                                text: subItem.label,
                                icon: subItem.icon,
                                disabled: subItem.disabled,
                                index: 1,
                                context: displayOptions.context,
                                callback: ((event: any) => {
                                    displayOptions.menuItemCallback({ menuItem: subItem, geom: g, event: event, context: displayOptions.context })
                                })
                            }
                            menuItem.submenuItems.push(submenuItem);
                        }
                    } else {
                        menuItem.context = displayOptions.context;
                        menuItem.callback = ((event: any) => {
                            displayOptions.menuItemCallback({ menuItem: item, geom: g, event: event, context: displayOptions.context })
                        });
                    }
                    options.shapeOptions.contextmenuItems.push(menuItem);
                }
            }

            switch (g.type) {
                case GeometryType$v1.circle:
                    this.drawing = new L.Draw.Circle(this.map as L.DrawMap, options);
                    this.lastDrawnShapeLayer = (this.drawing as any).initShape(coords, radius, DrawMode.Display);
                    break;
                case GeometryType$v1.line:
                    this.updateMaskBufferRadius(radius);
                    // options.shapeOptions.opacity = 0; // Hide line when in Display Mode
                    this.drawing = new L.Draw.Polyline(this.map as L.DrawMap, options);
                    this.lastDrawnShapeLayer = (this.drawing as any).initShape(coords, DrawMode.Display);
                    g.bufferLayer = this.drawBuffer(g, displayOptions);
                    this.lastDrawnShapeLayer.bufferLayer = g.bufferLayer;
                    break;
                case GeometryType$v1.rectangle:
                case GeometryType$v1.polygon:
                    this.drawing = new L.Draw.Polygon(this.map as L.DrawMap, options);
                    this.lastDrawnShapeLayer = (this.drawing as any).initShape(coords, false, DrawMode.Display);
                    break;
            }

            if (this.lastDrawnShapeLayer) {
                // this.lastDrawnShapeLayer.options.pane = options.shapeOptions.pane;

                if (g.useAsMask) {
                    this.maskShapeLayer = this.lastDrawnShapeLayer;
                    this.maskOptions = { pane: displayOptions.pane };

                    this.createDrawMask(this.lastDrawnShapeLayer, false, displayOptions.pane, false);
                }

                if (displayOptions?.featureGroup) {
                    if (this.lastDrawnShapeLayer.bufferLayer) {
                        displayOptions.featureGroup.addLayer(this.lastDrawnShapeLayer.bufferLayer);
                    } else {
                        displayOptions.featureGroup.addLayer(this.lastDrawnShapeLayer);
                    }
                }
            }
        }

        this.radiusChange.next(+(g.radius / 1000).toFixed(2));

        return (this.lastDrawnShapeLayer);
    }

    updateGeometry(g: Geometry$v1, mapGeom: any) {
    }

    /**
     * Draw the given geometry on the map
     * @param g Geometry to draw on the map
     */
    drawGeometry(g: Geometry$v1): any {
        if (g) {
            g.capabilityId = this.capabilityId;
            this.drawFromGeometry(g.type, g);
        }
        if (this.drawEditor) {
            this.drawEditor.disable();
        }

        this.radiusChange.next(+(g.radius / 1000).toFixed(2));
    }

    /**
     * Draw the given geometry on the map in edit mode
     * @param g Geometry to draw on the map
     */
    drawEditGeometry(g: Geometry$v1, centerGeometry?: boolean, padding?: PixelPoint$v1) {
        if (this.drawEditor) {
            this.drawEditor.enable();
        }

        if (g) {
            let options;
            g.capabilityId = this.capabilityId;

            if (g.style) {
                this.currentStyle = g.style;
                this.leafletStyle = this.mapCoreSvc.convertVectorStylePropsToLeafletOptions(this.currentStyle);

                options = {
                    shapeOptions: this.leafletStyle
                };
            }

            this.clearUndoHistory();
            this.drawFromGeometry(g.type, g, options);
            (g as any).iMap = this.iMap;
            if (this.lastDrawnShapeLayer && centerGeometry) {
                this.centerGeometry(padding);
            }
            this.toggleEdit(true);
        }

        this.radiusChange.next(+(g.radius / 1000).toFixed(2));
    }

    /**
     * This will fit the geometry currently being edited to the map view. An optional padding can be used
     * to ensure margins around the geometry.
     */
    centerGeometry(padding?: PixelPoint$v1) {
        const options: any = { padding: [20, 20] };
        if (this.lastDrawnShapeLayer) {
            const bnds = this.lastDrawnShapeLayer.getBounds();
            if (bnds) {
                if (padding) {
                    options.padding = [padding.x, padding.y];
                }

                this.map.fitBounds(bnds, options);
            }
        }
    }

    /**
     * Set the style used in the draw tool.  Update the style of any geometry being drawn/edited
     * @param style Style used to display shape layer
     */
    setStyle(style: VectorStyleProperties$v1) {
        this.currentStyle = style;

        if (this.lastDrawnShapeLayer) {
            this.leafletStyle = this.mapCoreSvc.convertVectorStylePropsToLeafletOptions(style);

            // Remove shape fill for lines
            const isLine = this.currentShape === GeometryType$v1.line;
            this.leafletStyle.fill = isLine ? false : this.leafletStyle.fill;

            this.lastDrawnShapeLayer.setStyle(this.leafletStyle);

            if (this.lastDrawnShapeLayer.bufferLayer) {
                this.leafletStyle.fill = true; 
                this.lastDrawnShapeLayer.bufferLayer.setStyle(this.leafletStyle);

                // this.drawBuffer(this.lastDrawnGeometry);
            }
        }
    }

    /**
     * Removes geometry layer from the map
     * @param leafletGeom Layer to remove
     */
    removeGeometry(leafletGeom: L.Layer) {
        const options = (leafletGeom as any).options;
        if (options?.featureGroup) {
            options.featureGroup.removeLayer(leafletGeom);
        } else {
            this.featGroup.removeLayer(leafletGeom);
        }
    }

    /**
     * Undo changes to geometry
     */
    undo(): void {
        this.isReady$.pipe(
            filter(isReady => isReady),
            first()
        ).subscribe(() => {
            if (!this.geometryHistory.length && this.drawing instanceof L.Draw.Polygon || this.drawing instanceof L.Draw.Polyline) {

                // Removes last drawn vertex
                const deletedVertex = this.drawing.deleteLastVertex();
                this.deletedVertices.push(deletedVertex);
                this.drawingVertices = this.drawingVertices - 1;

                // If last vertex removed was the last one, reset draw toolbar. Otherwise enable redo option.
                if (this.drawingVertices === 0) {
                    this.drawing.disable();
                    this.canUndo.next(false);
                    this.reset();
                } else {
                    this.canRedo.next(true);
                }

            } else if (!!this.geometryHistory.length) {

                // Go back one step
                Promise.resolve().then(() => {
                    this.historyPointer -= 1;

                    if (this.historyPointer === -1) {
                        this.canUndo.next(false);
                        this.canRedo.next(true);
                        this.delete();
                        this.radiusChange.next(null);
                        return;
                    } else if (this.historyPointer === 0 && !this.deleteOnUndoComplete) {
                        this.canUndo.next(false);
                    }

                    this.canRedo.next(true);

                    this.delete();
                    const historyStep = this.geometryHistory[this.historyPointer];

                    this.drawFromGeometry(this.currentShape, historyStep);
                    if (historyStep.radius) {
                        this.radiusChange.next(+(historyStep.radius / 1000).toFixed(2));
                    }
                });

            } else {

                this.featGroup.removeLayer(this.lastDrawnShapeLayer);
                this.canUndo.next(false);
                this.canRedo.next(true);

            }
        });
    }

    /**
     * Updates the current edit geometry.
     * @param g New geometry
     */
    updateGeometryEdit(g: Geometry$v1): void {
        this.geometryEditUpdate = true;
        this.delete();
        this.drawFromGeometry(g.type, g);
    }

    /**
     * Redo an undo made to the geometry
     */
    redo(): void {
        this.isReady$.pipe(
            filter(isReady => isReady),
            first()
        ).subscribe(() => {
            if (this.deletedVertices.length && this.drawing instanceof L.Draw.Polygon || this.drawing instanceof L.Draw.Polyline) {
                // Handles redo for polygon/polyline while drawing
                // Adds back previously removed vertex and removes it from the array
                this.drawing.addVertex(this.deletedVertices[this.deletedVertices.length - 1], false);
                this.deletedVertices.pop();
                this.drawingVertices = this.drawingVertices + 1;

                // If all vertices have been restored, prevents redo again.
                if (!this.deletedVertices.length) {
                    this.canRedo.next(false);
                }

                this.canUndo.next(true);
            } else if (!!this.geometryHistory.length) {
                // Go forward one step
                ++this.historyPointer;
                if (this.historyPointer === this.geometryHistory.length - 1) {
                    this.canRedo.next(false);
                }
                this.delete();
                const historyStep = this.geometryHistory[this.historyPointer];
                this.drawFromGeometry(this.currentShape, historyStep);

                if (historyStep.radius) {
                    this.radiusChange.next(+(historyStep.radius / 1000).toFixed(2));
                }

                this.canUndo.next(true);
            } else { // Handles redo for completed shapes.
                this.featGroup.addLayer(this.lastDrawnShapeLayer);
                this.canRedo.next(false);
                this.canUndo.next(true);
            }

            this.cdr.markForCheck();
            this.cdr.detectChanges();
        });
    }

    /**
     * Draws geometry
     * @param type Type of geometry to draw
     * @param geometry Geometry object to draw
     * @param options Geometry options
     */
    private drawFromGeometry(type: GeometryType$v1, geometry: Geometry$v1, options?: any) {
        this.lastDrawnGeometry = geometry;
        this.currentShape = type;

        const coords = type !== GeometryType$v1.circle && type !== GeometryType$v1.line ? geometry.coordinates[0] : geometry.coordinates;

        let shape;
        switch (type) {
            case GeometryType$v1.circle:
                this.drawing = new L.Draw.Circle(this.map as L.DrawMap, options);
                shape = (this.drawing as any).initShape(coords, geometry.radius);
                break;
            case GeometryType$v1.line:
                this.updateMaskBufferRadius(geometry.radius);
                this.drawing = new L.Draw.Polyline(this.map as L.DrawMap, options);
                shape = (this.drawing as any).initShape(coords);
                break;
            case GeometryType$v1.rectangle:
            case GeometryType$v1.polygon:
                this.drawing = new L.Draw.Polygon(this.map as L.DrawMap, options);
                shape = (this.drawing as any).initShape(coords);
                break;
        }

        return (shape);
    }

    /**
     * Undo all operations
     */
    undoAll(): void {
        const hasHistory = !this.geometryHistory.length
        const isPolyShape = this.drawing instanceof L.Draw.Polygon || this.drawing instanceof L.Draw.Polyline;
        if (hasHistory && isPolyShape) {
            while (this.drawingVertices !== 0) {
                this.undo();
            }
        }

        if (this.deleteOnUndoComplete) {
            this.delete();
            this.historyPointer = -1;
        } else {
            this.historyPointer = 1;
            this.undo();
        }

        this.radiusChange.next(null);
        this.canUndo.next(false);
        this.canRedo.next(true);
    }

    /**
     * Delete current geometry
     */
    delete(): void {
        this.isReady$.pipe(
            filter(isReady => isReady),
            first()
        ).subscribe(() => {
            // If actively drawing a polygon, reset drawing.
            if (this.drawingVertices > 0) {
                this.drawing.disable();
                this.drawingVertices = 0;
            }

            if (this.drawEditor) {
                this.drawEditor.disable();

                new L.Draw.DeleteDraw(this.map as L.DrawMap, {
                    featureGroup: this.featGroup
                } as L.ToolbarOptions).removeAllLayers();

                this.drawEditor = null;
            }

            // Remove buffer if shape was a filter 
            const usedAsFilter = !this.lastDrawnGeometry?.sourceId;
            if (usedAsFilter) {
                this.removeBuffer(this.lastDrawnGeometry?.bufferLayer);
            }

            this.updateMaskBufferRadius();
            this.reset();
            this.clearMask();
            this.lastDrawnShapeLayer = null;
            this.lastDrawnGeometry = null;

            // Let others know that geometry is going to null
            const capabilityId = this.geometry.getValue()?.capabilityId;
            if (capabilityId) {
                this.geometry.next(new Geometry$v1({
                    id: null,
                    type: null,
                    capabilityId: capabilityId,
                    useAsMask: false
                }));
            }

            this.geometry.next(null);
        });
    }

    /**
     * Toggles edit mode
     * @param isEnabled Editor is enabled flag
     */
    toggleEdit(isEnabled: boolean): void {
        this.isReady$.pipe(
            filter(isReady => isReady),
            first()
        ).subscribe(() => {
            if (isEnabled && this.drawEditor) {
                this.drawEditor.enable();
                if (this.lastDrawnShapeLayer) {
                    this.deleteOnUndoComplete = false;
                    const currentItem = this.geometryHistory.pop();
                    this.clearUndoHistory();
                    this.geometryHistory = [currentItem];
                    this.historyPointer = 0;
                }
            } else if (this.drawEditor) {
                this.drawEditor.disable();
            }
        });
    }

    /**
     * Resets the drawing
     */
    private reset(): void {
        if (this.drawing) {
            this.drawing.cancelDrawing();
            this.drawing = null;
            this.clearMask();
        }
    }

    /**
     * Fired when geometry is created
     * @param e Leaflet event
     */
    private onGeometryCreated(e: L.LeafletEvent): void {
        this.reset();
        this.lastDrawnShapeLayer = e.layer;
        this.lastDrawnShapeLayer.options.pane = this.paneName;
        this.featGroup.addLayer(this.lastDrawnShapeLayer);
        if (this.currentShape === GeometryType$v1.line) {
            const bufferGeoJSON = Buffer(this.lastDrawnShapeLayer.toGeoJSON(), this.maskBufferRadius / 1000);
            this.lastDrawnShapeLayer.bufferLayer = (L as any).bufferMask(bufferGeoJSON, this.lastDrawnShapeLayer.options);
            this.featGroup.addLayer(this.lastDrawnShapeLayer.bufferLayer);
        }
        this.drawingVertices = 0;

        if (this.autoEdit) {
            // Put layer into edit mode
            this.drawEditor = new L.Draw.EditDraw(this.map as L.DrawMap, {
                featureGroup: this.featGroup
            } as L.ToolbarOptions);
            this.drawEditor.enable();

            this.createDrawMask(this.lastDrawnShapeLayer, this.historyPointer === -1 || this.geometryEditUpdate);
            this.geometryEditUpdate = false;
        } else {
            // Need to immediately fire geometry.
        }
    }

    /**
     * Fired when geometry is updated
     * @param e Leaflet event
     */
    private onGeometryUpdated(e: L.DrawEvents.Edited): void {
        let layer: any;
        if (e.type === L.Draw.Event.EDITMOVE || e.type === L.Draw.Event.EDITRESIZE) {
            layer = e.layer;
        } else {
            layer = e.layers.getLayers()[0];
        }

        if (layer) {
            if (this.currentShape === GeometryType$v1.line && this.lastDrawnShapeLayer.bufferLayer) {
                const bufferGeoJSON = Buffer(this.lastDrawnShapeLayer.toGeoJSON(), this.maskBufferRadius / 1000);
                this.lastDrawnShapeLayer.bufferLayer.setLatLngs(bufferGeoJSON.geometry);
            }    
            this.createDrawMask(this.lastDrawnShapeLayer, e.type === 'draw:undoableedit');
        }
    }

    /**
     * Show the filter mask
     */
    showDrawMask(): void {
        this.createDrawMask(this.maskShapeLayer, false, this.maskOptions?.pane, false);
    }

    /**
     * Creates draw mask around given shape
     */
    private createDrawMask(shape: any, saveHistory: boolean = false, pane = null, notify = true): void {
        this.clearMask();

        // Create GeoJSON object from shape
        const geoJSON = shape?.toGeoJSON();
        let circle = null;
        if (this.currentShape === GeometryType$v1.circle) {
            circle = this.circleToPolygon(shape, 60).toGeoJSON();
        }

        // Draw mask
        const isLine = this.currentShape === GeometryType$v1.line;
        if (isLine) {
            // Draw mask around buffer
            const bufferGeoJSON = Buffer(geoJSON, this.maskBufferRadius / 1000);
            this.drawMask = (L as any).mask(bufferGeoJSON, {
                pane: pane ? pane : this.maskPaneName,
                interactive: false,
                bubblingMouseEvents: false
            }).addTo(this.map);
        } else if (!circle) {
            this.drawMask = (L as any).mask(geoJSON, {
                pane: pane ? pane : this.maskPaneName,
                interactive: false,
                bubblingMouseEvents: false
            }).addTo(this.map);
        } else {
            this.drawMask = (L as any).mask(circle, {
                pane: pane ? pane : this.maskPaneName,
                interactive: false,
                bubblingMouseEvents: false
            }).addTo(this.map);
        }

        // Set radius if circle, buffer is line
        let radius = null;
        if (this.currentShape === GeometryType$v1.circle) {
            radius = this.lastDrawnShapeLayer.getRadius();
        } else if (isLine) {
            radius = this.maskBufferRadius;
        }

        if (notify) {
            this.lastDrawnGeometry = new Geometry$v1({
                capabilityId: this.capabilityId,
                type: this.currentShape,
                coordinates: geoJSON.geometry.coordinates,
                radius: radius
            });

            this.geometry.next(this.lastDrawnGeometry);
        }

        if (saveHistory) {
            // Clear history going forward

            if (this.historyPointer !== this.geometryHistory.length - 1) {
                this.geometryHistory = this.geometryHistory.slice(0, this.historyPointer + 1);
            }

            this.geometryHistory = this.geometryHistory.concat(new Geometry$v1({
                capabilityId: this.capabilityId,
                type: this.currentShape,
                coordinates: geoJSON.geometry.coordinates,
                radius: radius
            } as Geometry$v1));

            this.canUndo.next(true);
            this.historyPointer = this.geometryHistory.length - 1;

            this.canRedo.next(false);
        }

        this.maskShown.next(true);

        this.cdr.markForCheck();
        this.cdr.detectChanges();
    }

    /**
     * Draws inside mask to display buffer
     */
    drawBuffer(g: Geometry$v1, displayOptions?: any): L.LayerGroup {
        const currentBuffer: L.LayerGroup = g.bufferLayer;
        const hasOpacity = this.leafletStyle?.fillOpacity || this.leafletStyle?.opacity;
        if (hasOpacity) {
            this.removeBuffer(currentBuffer);
            let featGroup;
            if (displayOptions?.featureGroup) {
                featGroup = displayOptions.featureGroup;
            } else {
                featGroup = this.featGroup;
            }

            const options = {...this.leafletStyle};
            if (displayOptions?.pane) {
                options.pane = displayOptions.pane
            }
            options.fill = true;
            options.bubblingMouseEvents = false;
            options.contextmenu = true;
            options.contextmenuItems = [];

            if (g.contextMenu?.length > 0) {
                for (const item of g.contextMenu) {
                    const menuItem: any = {
                        text: item.label,
                        icon: item.icon,
                        disabled: item.disabled,
                        index: 1,
                        submenuItems: null
                    }

                    if (item.submenuItems?.length > 0) {
                        menuItem.submenuItems = [];
                        for (const subItem of item.submenuItems) {
                            const submenuItem = {
                                text: subItem.label,
                                icon: subItem.icon,
                                disabled: subItem.disabled,
                                index: 1,
                                context: displayOptions.context,
                                callback: ((event: any) => {
                                    displayOptions.menuItemCallback({ menuItem: subItem, geom: g, event: event, context: displayOptions.context })
                                })
                            }
                            menuItem.submenuItems.push(submenuItem);
                        }
                    } else {
                        menuItem.context = displayOptions.context;
                        menuItem.callback = ((event: any) => {
                            displayOptions.menuItemCallback({ menuItem: item, geom: g, event: event, context: displayOptions.context })
                        });
                    }
                    options.contextmenuItems.push(menuItem);
                }
            }

            // Draw new buffer mask
            const bufferGeoJSON = Buffer(this.lastDrawnShapeLayer.toGeoJSON(), this.maskBufferRadius / 1000);
            const newBufferMask = (L as any).bufferMask(bufferGeoJSON, options);
            this.lastDrawnGeometry.bufferLayer = newBufferMask;

            return newBufferMask;
        }
    }

    /**
     * Clears all undo history
     */
    private clearUndoHistory() {
        this.geometryHistory = [];
        this.historyPointer = -1;
        this.canRedo.next(false);
        this.canUndo.next(false);
    }

    /**
     * Clears draw mask if there is one
     */
    clearMask(): void {
        if (this.drawMask) {
            this.map.removeLayer(this.drawMask);
        }

        this.maskShown.next(false);
    }

    /**
     * Removes buffer layer if there is one
     */
    removeBuffer(currentBuffer: L.LayerGroup): void {
        if (currentBuffer) {
            const geomInfo = (currentBuffer as any)._geomInfo;
            if (geomInfo?.featureGroup) {
                geomInfo.featureGroup.removeLayer(currentBuffer);
            } else {
                this.featGroup.removeLayer(currentBuffer);
            }
            // this.map.removeLayer(currentBuffer);
            currentBuffer = null;
        }
    }
    /**
     * Fired when a radius is updated
     * @param e 
     */
    private radiusUpdate(e): void {
        const radius: number = +(e.radius / 1000).toFixed(2); // Convert to km
        this.radiusChange.next(radius);
    }

    /**
     * Updates the buffer used for polyline mask
     * @param radius Radius in km
     */
    private updateMaskBufferRadius(radius?: number): void {
        if (radius) {
            this.maskBufferRadius = radius;
        } else {
            this.maskBufferRadius = this.defaultMaskBufferRadius;
        }
    }

    /**
     * Fired when vertex added to polygon/polyline
     * @param e Leaflet event
     */
    private drawPolyVertex(e: L.LeafletEvent): void {
        this.clearUndoHistory();

        this.canRedo.next(false);
        this.canUndo.next(true);

        this.deletedVertices = [];
        this.drawingVertices += 1;
    }

    /**
     * Turns circle into a polygon
     */
    private circleToPolygon(circle, sides = 60, withBearing = true) {
        const origin = circle.getLatLng();
        const radius = circle.getRadius();
        const polys = this.createGeodesicPolygon(origin, radius, sides, 0); // these are the points that make up the circle
        const polygon = [];

        for (let i = 0; i < polys.length; i += 1) {
            const geometry = [polys[i].lat, polys[i].lng];
            polygon.push(geometry);
        }

        return L.polygon(polygon, circle.options);
    }

    /**
     * Creates points from circle information
     */
    private createGeodesicPolygon(origin, radius, sides, rotation) {
        let angle;
        let newLonlat;
        let geomPoint;
        const points = [];

        for (let i = 0; i < sides; i += 1) {
            angle = (i * 360 / sides) + rotation;
            newLonlat = this.destinationVincenty(origin, angle, radius);
            geomPoint = L.latLng(newLonlat.lng, newLonlat.lat);
            points.push(geomPoint);
        }

        return points;
    }

    /**
     * Calculates point on circle
     */
    private destinationVincenty(lonlat, brng, dist) { // rewritten to work with leaflet
        const VincentyConstants = {
            a: 6378137,
            b: 6356752.3142,
            f: 1 / 298.257223563
        };

        const { a, b, f } = VincentyConstants;
        const lon1 = lonlat.lng;
        const lat1 = lonlat.lat;
        const s = dist;
        const pi = Math.PI;
        const alpha1 = brng * pi / 180; // converts brng degrees to radius
        const sinAlpha1 = Math.sin(alpha1);
        const cosAlpha1 = Math.cos(alpha1);
        const tanU1 = (1 - f) * Math.tan(lat1 * pi / 180 /* converts lat1 degrees to radius */);
        const cosU1 = 1 / Math.sqrt((1 + tanU1 * tanU1));
        const sinU1 = tanU1 * cosU1;
        const sigma1 = Math.atan2(tanU1, cosAlpha1);
        const sinAlpha = cosU1 * sinAlpha1;
        const cosSqAlpha = 1 - sinAlpha * sinAlpha;
        const uSq = cosSqAlpha * (a * a - b * b) / (b * b);
        const A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
        const B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
        let sigma = s / (b * A);
        let sigmaP = 2 * Math.PI;

        let cos2SigmaM;
        let sinSigma;
        let cosSigma;
        while (Math.abs(sigma - sigmaP) > 1e-12) {
            cos2SigmaM = Math.cos(2 * sigma1 + sigma);
            sinSigma = Math.sin(sigma);
            cosSigma = Math.cos(sigma);
            const deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
                B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));
            sigmaP = sigma;
            sigma = s / (b * A) + deltaSigma;
        }
        const tmp = sinU1 * sinSigma - cosU1 * cosSigma * cosAlpha1;
        const lat2 = Math.atan2(sinU1 * cosSigma + cosU1 * sinSigma * cosAlpha1,
            (1 - f) * Math.sqrt(sinAlpha * sinAlpha + tmp * tmp));
        const lambda = Math.atan2(sinSigma * sinAlpha1, cosU1 * cosSigma - sinU1 * sinSigma * cosAlpha1);
        const C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
        const lam = lambda - (1 - C) * f * sinAlpha *
            (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
        // const revAz = Math.atan2(sinAlpha, -tmp);  // final bearing
        const lamFunc = lon1 + (lam * 180 / pi); // converts lam radius to degrees
        const lat2a = lat2 * 180 / pi; // converts lat2a radius to degrees

        return L.latLng(lamFunc, lat2a);
    }

    /**
     * Set up routine for localization
     */
    private async initLocalization(): Promise<void> {
        const tokens: string[] = Object.values(DrawToolbarTranslationTokens);
        const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);

        this.tTokens.circle = translatedTokens[DrawToolbarTranslationTokens.circle];
        this.tTokens.clickAndDrag = translatedTokens[DrawToolbarTranslationTokens.clickAndDrag];
        this.tTokens.clickTheFirstPointToFinish = translatedTokens[DrawToolbarTranslationTokens.clickTheFirstPointToFinish];
        this.tTokens.clickToAddMorePoints = translatedTokens[DrawToolbarTranslationTokens.clickToAddMorePoints];
        this.tTokens.clickToStartDrawing = translatedTokens[DrawToolbarTranslationTokens.clickToStartDrawing];
        this.tTokens.polygon = translatedTokens[DrawToolbarTranslationTokens.polygon];
        this.tTokens.rectangle = translatedTokens[DrawToolbarTranslationTokens.rectangle];
        this.tTokens.redo = translatedTokens[DrawToolbarTranslationTokens.redo];
        this.tTokens.releaseToFinish = translatedTokens[DrawToolbarTranslationTokens.releaseToFinish];
        this.tTokens.startOver = translatedTokens[DrawToolbarTranslationTokens.startOver];
        this.tTokens.undo = translatedTokens[DrawToolbarTranslationTokens.undo];
        this.tTokens.noIntersect = translatedTokens[DrawToolbarTranslationTokens.noIntersect];
        this.tTokens.deleteWillIntersect = translatedTokens[DrawToolbarTranslationTokens.deleteWillIntersect];
        this.tTokens.doubleClickToFinish = translatedTokens[DrawToolbarTranslationTokens.doubleClickToFinish];
    }
}
