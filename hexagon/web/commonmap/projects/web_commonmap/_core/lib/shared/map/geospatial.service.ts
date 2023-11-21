import { Injectable } from '@angular/core';
import * as turf from '@turf/turf';
import * as L from 'leaflet';

@Injectable()
export class GeoSpatialService$v1 {
    map: L.Map;

    constructor(map: any) {
        this.map = map; 
    }

    createGeoJSONPolygonFeatureFromContainerPt(contPoint:L.Point, size: number) {
        
        let poly: turf.Feature;

        const halfSize = size/2;
        if (this.map) {
            const points: L.Point[] = [];
            points.push(new L.Point(contPoint.x - halfSize, contPoint.y - halfSize));
            points.push(new L.Point(contPoint.x + halfSize, contPoint.y - halfSize));
            points.push(new L.Point(contPoint.x + halfSize, contPoint.y + halfSize));
            points.push(new L.Point(contPoint.x - halfSize, contPoint.y + halfSize));
            points.push(points[0]);

            const coords = [];
            for (let point of points) {
                if (point.x < 0) {
                    point.x = 0;
                }

                if (point.y < 0) {
                    point.y = 0; 
                }

                const temp = this.map.containerPointToLatLng(point);
                coords.push([temp.lng, temp.lat]);
            }

            poly = turf.polygon([coords]);
        }
        
        return(poly);
    }

    createGeoJSONPolygonFeatureFromPt(latLng: L.LatLng, size: number) {
        
        let poly: turf.Feature;

        const halfSize = size/2;
        if (this.map) {
            const contPoint = this.map.latLngToContainerPoint(latLng);
            const points: L.Point[] = [];
            points.push(new L.Point(contPoint.x - halfSize, contPoint.y - halfSize));
            points.push(new L.Point(contPoint.x + halfSize, contPoint.y - halfSize));
            points.push(new L.Point(contPoint.x + halfSize, contPoint.y + halfSize));
            points.push(new L.Point(contPoint.x - halfSize, contPoint.y + halfSize));
            points.push(points[0]);

            const coords = [];
            for (let point of points) {
                if (point.x < 0) {
                    point.x = 0;
                }

                if (point.y < 0) {
                    point.y = 0; 
                }

                const temp = this.map.containerPointToLatLng(point);
                coords.push([temp.lng, temp.lat]);
            }

            poly = turf.polygon([coords]);
        }
        
        return(poly);
    }

    /**
     * 
     * @param feature1 
     * @param feature2 
     * @returns  Flag indicating whether the two area/line features have any intersection pts.
     */
    featuresIntersect(feature1, feature2): boolean {
        let intersect = false;
        try {
            const geom1 = turf.getGeom(feature1);
            const geom2 = turf.getGeom(feature2);

            switch (geom2.type.toLowerCase()) {
                case 'polygon':
                case 'multipolygon': {
                    intersect = turf.booleanWithin(geom1, geom2);
                    if (!intersect) {
                        const intersectPts = turf.lineIntersect(geom1, geom2);
                        intersect = intersectPts.features.length > 0;
                    }
                    break;
                }
                case 'point': {
                    intersect = turf.booleanPointInPolygon(geom2, geom1);
                    break;
                } 
                case 'linestring':
                case 'multilinestring': {
                    const intersectPts = turf.lineIntersect(geom1, geom2);
                    intersect = intersectPts.features.length > 0;
                    break;
                }
            }
        } catch (err) {
            console.log('Error testing for feature intersection');
        }

        return (intersect);
    }


    featuresOverlap(geoJSON1, geoJSON2) {
        let overlap = false;
        try {
            const bbox1 = turf.bbox([geoJSON1]);
            const bbox2 = turf.bbox([geoJSON2]);
            let bboxPoly1;
            let bboxPoly2;
            if (bboxPoly1) {
                bboxPoly1 = turf.bboxPolygon(bbox1);
            }
            if (bboxPoly1 && bbox2) {
                bboxPoly2 = turf.bboxPolygon(bbox1);

                if (bboxPoly2) {
                    overlap = turf.booleanOverlap(bboxPoly1, bboxPoly2);
                }
            }
        } catch (err) {
            console.log('Error testing for bounds overlay');
        }

        return (overlap);
    }
}
