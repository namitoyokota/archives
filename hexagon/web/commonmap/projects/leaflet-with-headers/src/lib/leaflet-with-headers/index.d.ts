import * as L from 'leaflet';
import {Observable, Subject} from 'rxjs';

declare module 'leaflet' {
    namespace TileLayer {

        export interface WMTSOptions extends TileLayerOptions {
            service: string;
            request: string;
            version: string;
            layer: string;
            style: string;
            tileMatrixSetId: string;
            format: string;
            tileMatrices: any;
            requestParams: any;
        }

        export class WMSHeader extends WMS {
            constructor(
                baseUrl: string,
                options: WMSOptions,
                header: { header: string; value: string }[],
                abort: Observable<any>
            );
        }
        export function wmsHeader(
            baseUrl: string,
            options: WMSOptions,
            header: { header: string; value: string }[],
            abort: Observable<any>
        ): L.TileLayer.WMSHeader;

        export class TileLayerWithHeaders extends TileLayer {
        constructor(
            baseUrl: string,
            options: TileLayerOptions,
            header: { header: string; value: string }[],
            abort: Observable<any>
        );
        }
        export function tileLayerWithHeaders(
            baseUrl: string,
            options: TileLayerOptions,
            header: { header: string; value: string }[],
            abort: Observable<any>
        ): L.TileLayer.TileLayerWithHeaders;

        export class WMTSWithHeaders extends TileLayer {
        constructor(
            baseUrl: string,
            options: WMTSOptions,
            header: { header: string; value: string }[]
        );
        }

        export function wmtsWithHeaders(
            baseUrl: string,
            options: WMTSOptions,
            header: { header: string; value: string }[]
        ): L.TileLayer.WMTSWithHeaders;
    }
}
