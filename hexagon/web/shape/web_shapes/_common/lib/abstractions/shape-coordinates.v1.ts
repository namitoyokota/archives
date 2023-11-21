/**
 * Coordinates that make up a shape's geometry.
 */
export class ShapeCoordinates$v1 {

  /** Coordinates of the man shape */
  mainShape?: Array<Array<number>>;

  constructor(param: ShapeCoordinates$v1 = {} as  ShapeCoordinates$v1) {
    const {
      mainShape = []
    } = param;

    if (mainShape?.length) {
      this.mainShape = [...mainShape];
    } else {
      this.mainShape = [];
    }
  }
}
