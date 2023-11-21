import * as L from 'leaflet';
import { Observable, Subject } from 'rxjs';

declare module 'leaflet' {
    namespace GeoJSON {
        export class AJAX extends GeoJSON {
            constructor(
                url: string,
                options: any,
            );
            clearLayers();
            addUrl(
                url: string
            );
            refresh(
                url: string
            );
            refilter(
                func: any
            );
        }
        export function ajax(
            url: string,
            options: any,
        ): L.GeoJSON.AJAX;
    }
}
