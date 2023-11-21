import { Injectable } from '@angular/core';
import { LayoutCompilerAdapterService, MailBox } from '@galileo/web_commonlayoutmanager/adapter';
import { CommonmapAdapterService$v1, Geometry$v1 } from '@galileo/web_commonmap/adapter';
import * as Common from '@galileo/web_shapes/_common';
import { Shape$v1 } from '@galileo/web_shapes/_common';
import P from 'robust-point-in-polygon';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, first } from 'rxjs/operators';

import { ShapesAdapterModule } from './adapter.module';

@Injectable({
  providedIn: 'root'
})
/**
 * The adapter service is the public API that other capabilities can consume.
 */
export class ShapesAdapterService$v1 {

    constructor(
      private shapesMailbox: Common.CommonMailboxService,
      private layoutCompiler: LayoutCompilerAdapterService,
      private mapAdapter: CommonmapAdapterService$v1,
    ) {
      // Make sure the core module is loaded
      this.layoutCompiler.loadCapabilityCoreAsync(Common.capabilityId);
    }

    /**
     * Get notifications when the shape filter changes.
     * @param contextId Id of the context of the component
     */
    shapeFilterChangeAsync(contextId: string): Promise<Observable<Common.ShapeFilter$v1>> {
      return new Promise(async resolve => {

        const mailBox = new MailBox<string, BehaviorSubject<Common.ShapeFilter$v1>>(contextId);

        // Listen for response in the mailbox
        mailBox.response.pipe(first()).subscribe(bs => {
            resolve(bs);
        });

        await this.waitOnCore();
        this.shapesMailbox.mailbox$v1.onShapeFilterAction$.next(mailBox);

      });
    }

    /**
     * Returns true if the point is in the geometry
     * @param geometry Geometry to check
     * @param point Point to check
     * @returns True if point is in the polygon
     */
    isPointInGeometry(geometry: Common.ShapeFilter$v1, point: number[]): boolean {
      if (!geometry.type) {
        return false;
      }

      if (geometry.type === 'Circle') {
        return this.isPointInCircle(geometry.coordinates as any, geometry.radius, point);
      } else if (geometry.type === 'Line') {
        return this.isPointInLine(geometry.coordinates as any, geometry.radius, point);
      } else {
        return this.isPointInPolygon(geometry.coordinates as any, point);
      }

    }

    /**
     * Use a geometry as a shape filter.
     * @param geometry Geometry to use as filter
     * @param contextId The contextId of the view
     */
    useAsShapeFilterAsync(geometry: Geometry$v1, contextId: string): Promise<void> {
      return new Promise(async (resolve, reject) => {
        await this.waitOnCore();

        const mailBox = new MailBox<[Geometry$v1, string], void>(
          [geometry, contextId]
        );

        mailBox.response.pipe(first()).subscribe(
          () => {
            resolve();
          },
          () => {
            reject();
          }
        )

        this.shapesMailbox.mailbox$v1.useAsShapeFilter$.next(mailBox);

      });
    }

    /**
     * Start the process of creating a shape with an UI
     * @param geometry Geometry to use as a starting point for a shape
     */
    async startCreateShapeAsync(geometry?: Geometry$v1): Promise<Shape$v1> {
      return new Promise(async (resolve, reject) => {
        await this.waitOnCore();

        const mailBox = new MailBox<Geometry$v1, Shape$v1>(geometry);
        mailBox.response.pipe(first()).subscribe(
          (shape) => {
            resolve(shape);
          },
          () => {
            reject();
          }
        );

        this.shapesMailbox.mailbox$v1.startCreateSmartShape$.next(mailBox);

      });

    }

    /**
     * Returns true if point is in polygon
     * @param polygon Polygon to check for
     * @param point Point to check if is in polygon
     */
    private isPointInPolygon(polygon: [number[]], point: number[]): boolean {
      if (!polygon?.length) {
        return false;
      }

      const rawVal: number = (P(polygon[0] as any, point as any));
      return !!(rawVal <= 0);
    }

    /**
     * Returns true if point is inside the circle
     * @param center Center point of circle
     * @param distance radius of circle
     */
    private isPointInCircle(center: number[], radius: number, point: number[]): boolean {
      const lat = 1;
      const lon = 0;

      const lat1 = center[lat];
      const lat2 = point[lat];
      const lon1 = center[lon];
      const lon2 = point[lon];

      // Use the haversine formula
      const R = 6371e3; // metres
      const A1 = lat1 * Math.PI / 180;
      const A2 = lat2 * Math.PI / 180;
      const Delta1 = (lat2 - lat1) * Math.PI / 180;
      const Delta2 = (lon2 - lon1) * Math.PI / 180;

      const a = Math.sin(Delta1 / 2) * Math.sin(Delta1 / 2) +
                Math.cos(A1) * Math.cos(A2) *
                Math.sin(Delta2 / 2) * Math.sin(Delta2 / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      const d = R * c; // in metres

      return d < radius;
    }

    /**
     * Returns true if point is inside the line buffer
     * @param line Line coordinates
     * @param radius Radius buffer of the line
     * @param point Point to check if is in line buffer
     */
    private isPointInLine(line: [number[]], radius: number, point: number[]): boolean {
      return this.mapAdapter.distanceFromLine(line, point) < radius;
    }

    /**
     * Allows a method to wait for the core to be loaded
     */
    private waitOnCore(): Promise<void> {
      return new Promise<void>((resolve) => {
          this.shapesMailbox.mailbox$v1.coreIsLoaded$.pipe(
              filter(isLoaded => isLoaded),
              first()
          ).subscribe(() => {
              resolve();
          });
      });
    }
}
