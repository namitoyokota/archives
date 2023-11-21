export class CompareObjects {
  static deepCopy(objectToCopy: unknown) {
    return JSON.parse(JSON.stringify(objectToCopy));
  }

  static areEqual(objectOne: unknown, objectTwo: unknown) {
    return JSON.stringify(objectOne) === JSON.stringify(objectTwo);
  }
}
