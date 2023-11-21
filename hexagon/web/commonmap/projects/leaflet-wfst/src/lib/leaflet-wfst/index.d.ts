import * as L from 'leaflet';

declare module 'leaflet' {
    export interface WFSOptions {
        crs: any;
        showExisting: boolean;
        geometryField: string;
        url: string;
        typeNS: string;
        typeName: string;
        typeNSName: string;
        namespaceUri: string;
        opacity: number;
        style: any;
        filter: any;
        maxFeatures: number;
        headers: any;
        outputFormat: string;
    }

    export class WFS extends L.FeatureGroup {
        constructor(
            options: WFSOptions
        );
        refresh(): void;
        
    }
    export function wfs(
        options: WMSOptions
    ): L.WFS;

    namespace Format {
        export class GeoJSON {
            constructor(
                options: any
            );
        }

        export class GML {
            constructor(
                options: any
            );
        }
    }

}
