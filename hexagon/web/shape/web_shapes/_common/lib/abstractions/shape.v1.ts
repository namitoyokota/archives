import { Hyperlink$v1, Person$v1 } from '@galileo/web_common-libraries';
import { LineType$v1 } from '@galileo/web_common-libraries/graphical/line-type';
import { Geometry$v1, GeometryType$v1, VectorStyleProperties$v1 } from '@galileo/web_commonmap/adapter';

import { RestrictIds$v1 } from './restrict-ids.v1';
import { ShapeCoordinates$v1 } from './shape-coordinates.v1';
import { ShapeGraphicsSettings$v1 } from './shape-graphics-settings.v1';
import { ShapeType } from './shape-type.v1';

/**
 * Represents a shape
 */
export class Shape$v1 {

  /** A unique id for the shape */
  id?: string;

  /** The tenant that owns the shape */
  tenantId?: string;

  /** User give name of shape */
  name?: string;

  /** True if the shape is managed by connect */
  isManaged?: boolean;

  /** User give description of the shape */
  description?: string | undefined;

  /** The primary contact for this shape */
  primaryContact?: Person$v1 | undefined;

  /** The type of shape */
  shapeType?: ShapeType;

  /** The radius of a circle shape. */
  radius?: number;

  /** The coordinates that make up the shape's geometry */
  coordinates?: ShapeCoordinates$v1[];

  /** Graphical settings of the shape. The shape's look and feel. */
  graphicsSettings?: ShapeGraphicsSettings$v1;

  /** The groups that the shape is associated with*/
  groupIds?: string[];

  /** Type provided by the user/ gateway. */
  filteringType?: string | undefined;

  /** Keywords associated with the shape */
  keywords?: string[] | undefined;

  /** Property bag data */
  properties?: Record<string, string> | undefined;

  /** List of URLs */
  hyperlinks?: Hyperlink$v1[] | undefined;

  /** A value indicating whether this entity has been tombstoned. */
  tombstoned?: boolean;

  /** The time the entity was tombstoned */
  tombstonedTime?: Date;

  /** List of property groups that are redacted */
  private redactedList?: RestrictIds$v1[];

  constructor(param: Shape$v1 = {} as Shape$v1) {
    const {
      id = null,
      tenantId = null,
      name = null,
      isManaged = false,
      description = null,
      primaryContact = null,
      shapeType: type = null,
      radius = null,
      coordinates = [],
      graphicsSettings = null,
      groupIds = [],
      filteringType = null,
      keywords = [],
      properties = null,
      tombstoned = false,
      tombstonedTime = null,
      hyperlinks = []
    } = param;

    if (param?.redactedList) {
      this.redactedList = [...param?.redactedList];
    } else {
        this.markAsRedacted(param);
    }

    this.id = id;
    this.tenantId = tenantId;
    this.name = name;
    this.isManaged = isManaged;
    this.description = description;
    this.primaryContact = primaryContact ? new Person$v1(primaryContact) : null;
    this.shapeType = type;
    this.radius = radius;

    if (coordinates?.length) {
      this.coordinates = coordinates.map(c => new ShapeCoordinates$v1(c));
    } else {
      this.coordinates = [];
    }

    this.graphicsSettings = graphicsSettings ? new ShapeGraphicsSettings$v1(graphicsSettings) : null;
    this.groupIds = groupIds ? [...groupIds] : [];
    this.filteringType = filteringType;
    this.keywords = keywords ? [...keywords] : [];
    this.properties = properties;
    this.tombstoned = tombstoned;
    this.tombstonedTime = tombstonedTime;
    this.hyperlinks = hyperlinks;
  }

  /**
   * Checks if the provided property is redacted
   */
  isRedacted(property: RestrictIds$v1): boolean {
    return !!this.redactedList.find(item => item === property);
  }

  /**
   * Checks the shape object for any redacted properties
   */
  private markAsRedacted(shape: Shape$v1) {
    if (!this.redactedList) {
      this.redactedList = [];
    }

    if (shape.filteringType === undefined) {
      this.redactedList.push(RestrictIds$v1.filteringType);
    }

    if (shape.description === undefined) {
      this.redactedList.push(RestrictIds$v1.description);
    }

    if (shape.keywords === undefined) {
      this.redactedList.push(RestrictIds$v1.keywords);
    }

    if (shape.primaryContact === undefined) {
      this.redactedList.push(RestrictIds$v1.primaryContact);
    }

    if (shape.properties === undefined) {
      this.redactedList.push(RestrictIds$v1.properties);
    }

    if (shape.hyperlinks === undefined) {
      this.redactedList.push(RestrictIds$v1.hyperlinks);
    }
  }

  /**
   * Converts to a common map geometry object
   */
  toMapGeometry$v1?(capabilityId: string): Geometry$v1 {
    let coordinate;
    if (this.shapeType === ShapeType.circle) {
      coordinate = this.coordinates[0].mainShape[0];
    } else if (this.shapeType === ShapeType.line) {
      coordinate = this.coordinates[0]?.mainShape;
    } else {
      coordinate = [this.coordinates[0]?.mainShape];
    }

    return new Geometry$v1({
      sourceId: this.id,
      capabilityId: capabilityId,
      type: this.shapeType?.toString() as GeometryType$v1,
      radius: this.radius,
      coordinates: coordinate,
      useAsMask: false,
      style: new VectorStyleProperties$v1({
        lineColor: this.graphicsSettings.lineColor,
        lineWidth: this.graphicsSettings.lineWeight,
        fillColor: this.graphicsSettings.fillColor,
        linePattern: this.graphicsSettings.lineType.toString() as LineType$v1
      })
    });
  }

  /**
   * Returns a new shape based on the current shape and the given geometry
   */
  fromGeometry$v1?(geometry: Geometry$v1): Shape$v1 {
    let coordinate;
    if (geometry?.type?.toString() as ShapeType === ShapeType.circle) {
      coordinate = [geometry.coordinates];
    } else if (geometry?.type?.toString() as ShapeType === ShapeType.line) {
      coordinate = geometry.coordinates;
    } else {
      coordinate = geometry.coordinates[0];
    }

    const shape = new Shape$v1({
      ...this,
      shapeType: geometry?.type?.toString() as ShapeType,
      radius: geometry.radius,
      coordinates: [new ShapeCoordinates$v1({
        mainShape: coordinate
      })]
    });

    // Make sure coordinates have 3rd coordinate
    shape.coordinates[0].mainShape.map(c => {
      if (c?.length < 3) {
        c.push(0);
      }
      return c;
    });

    return shape;
  }

  /**
   * Checks if the give shape is equal
   * @param shape Shape to check against
   */
  isEqual?(shape: Shape$v1): boolean {
    const strA = JSON.stringify(this);
    const strB = JSON.stringify(shape);

    return strA === strB;
  }

  /**
   * Checks if the give shape is equal
   * @param shape Shape to check against
   */
  isCoordinatesEqual?(coord: ShapeCoordinates$v1[]): boolean {
    const strA = JSON.stringify(this.coordinates);
    const strB = JSON.stringify(coord);

    return strA === strB;
  }

  /**
   * Returns true is the shape is valid
   */
  isValid?(): boolean {
    return !!this.name?.trim()?.length && !!this.filteringType?.trim()?.length &&
      !!this.coordinates?.length && !!this.primaryContact;
  }
}
