import { Observable } from 'rxjs';

import { Geometry$v1, GeometryType$v1 } from './geometry.v1';
import { PixelPoint$v1 } from './pixelPoint.v1';
import { VectorStyleProperties$v1 } from './vectorStyleProps.v1';


/**
 * Interface for drawing on a map. This interface will be implemented
 * as a service to support drawing on the leaflet, lucid, or other map.
 */
export interface Draw {

    /** Capability Id that activated draw */
    capabilityId: string;

    /** Current geometry of the drawn shape */
    geometry$: Observable<Geometry$v1>;

    /** Flag that is true if there is an action that can be undone */
    canUndo$: Observable<boolean>;

    /** Flag that is true if there is an action that can be redone */
    canRedo$: Observable<boolean>;

    /** Flag that is true if a draw mask is shown */
    maskShown$: Observable<boolean>;

    /** The current value of the radius of a drawn circle */
    radiusChange$: Observable<number>;

    /** Draw a shape */
    draw(shape: GeometryType$v1);

    /** Undo the last action */
    undo(): void;

    /** Undoes all actions */
    undoAll(): void;

    /** Redo the last undone action */
    redo(): void;

    /** Delete geometry */
    delete(): void;

    /** Toggles if a shape can be edited */
    toggleEdit(isEnabled: boolean): void;

    /** Cancels drawing */
    cancel(): void;

    /** Clears the filter mask */
    clearMask(): void;

    /** Draw given geometry */
    drawGeometry(g: Geometry$v1, options?: any): void;

    /** Update geometry while in edit mode with history tracking */
    updateGeometryEdit(g: Geometry$v1);

    /** Creates and displays a geometry on the map. Returns the created map geometry object */
    displayGeometry(g: Geometry$v1, options?: any): any;

    /** Updates an exisiting geometry */
    updateGeometry(g: Geometry$v1, mapGeometry: any);

    /** Draw the given geometry on the map in edit mode */
    drawEditGeometry(g: Geometry$v1, centerGeometry?: boolean, padding?: PixelPoint$v1);

    /** Update the style of the geometry in draw */
    setStyle(style: VectorStyleProperties$v1);

    /**  Zoom the map to center around the geometry being edited or draw. */
    centerGeometry(padding?: PixelPoint$v1);
}
