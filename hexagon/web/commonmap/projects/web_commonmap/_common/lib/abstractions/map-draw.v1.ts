import { BehaviorSubject, Subject } from "rxjs";
import { Geometry$v1 } from "./geometry.v1";
import { MapInterface$v1 } from "./map-interfaces.v1";
import { VectorStyleProperties$v1 } from "./vectorStyleProps.v1";
import { PixelPoint$v1 } from "./pixelPoint.v1";
export class MapDrawSetup$v1 {

    /** Options parameter to set the tooltip of the draw button */
    drawButtonTooltip?: string;

    /** Draw Toolbar Title */
    drawToolbarTitle?: string;

    /** Initial Geometry */
    initialGeometry?: Geometry$v1;

    /** Flag to indicate if geometry is placed in edit mode when finished drawing */
    autoEdit?: boolean;

    /** Flag that is true if the shape should always be in edit mode. When this is true
     * the draw toolbar is always shown and the geometry is returned on every update.
     */
    persistentEdit?: boolean;

    constructor (params = {} as MapDrawSetup$v1) {
        const {
            drawButtonTooltip,
            drawToolbarTitle,
            initialGeometry,
            autoEdit = true,
            persistentEdit = false
        } = params;

        this.drawButtonTooltip = drawButtonTooltip;
        this.drawToolbarTitle = drawToolbarTitle;
        this.initialGeometry = initialGeometry;
        this.autoEdit = autoEdit;
        this.persistentEdit = persistentEdit;
    }
}

export class MapDraw$v1 {
    private geometry = new BehaviorSubject<Geometry$v1>(null);
    private start = new BehaviorSubject<string>(null);
    private activated = new BehaviorSubject<string>(null);

    // Temp way of showing and hiding the filter toolbar
    private displayFilterToolbar$ = new Subject<boolean>();

    constructor (private iMap: MapInterface$v1) {
    }
    
    /** Geometry of the current item drawn on the map */
    geometry$ = this.geometry.asObservable();

    /** Fired when the draw toolbar is activated.  Returns the capability id that called activate */
    activated$ = this.activated.asObservable();

    /** Fired when the draw toolbar is clicked to begin drawing */
    start$ = this.start.asObservable();

    /**
     * Activates the draw toolbar on the associated map
     * 
     * @param mapDrawSetup Optional parameters used to customize the map draw UI
     */
    activate(capabilityId: string, mapDrawSetup?: MapDrawSetup$v1): void {
        if (this.iMap?.iDraw) {
            this.iMap.iDraw.activateDraw(capabilityId, mapDrawSetup);
        }
    }

    /**
     * Deactivates the draw toolbar on the associated map
     * 
     */
    deactivate(): void {
        if (this.iMap?.iDraw) {
            this.iMap.iDraw.deactivateDraw();
        }
    }

    /**
     * Places the draw toolbar in edit mode with the geometry
     * 
     * @param geometry Geometry to edit with the draw toolbar
     * @param centerGeometry Optional parameter to fit the geometry being edited to the view.
     * @param padding Optional parameter to define margin around geometry being fit to view.  Default is 20px;
     * 
     */
     edit(geometry: Geometry$v1, centerGeometry?: boolean, padding?: PixelPoint$v1) {
        if (this.iMap?.iDraw) {
            this.iMap.iDraw.edit(geometry, centerGeometry, padding);
        }
    }

    /**
     * Clears anything that is drawn
     */
    clear(): void {
        if (this.iMap?.iDraw) {
            this.iMap.iDraw.clear();
        }
        this.geometry.next(null);
    }

    /**
     * Sets the style of the geometry being drawn or edited 
     * 
     * @param style Style properties 
     */
    setStyle(style: VectorStyleProperties$v1) {
        if (this.iMap?.iDraw) {
            this.iMap.iDraw.setStyle(style);
        }
    }

    /** 
     * Center the map around the geometry being edited or drawn
     * 
     * @param padding Optional parameter to define margin around geometry being fit to view.  Default is 20px;
     */

    centerGeometry(padding?: PixelPoint$v1) {
        if (this.iMap?.iDraw) {
            this.iMap.iDraw.centerGeometry(padding);
        }
    }
}
