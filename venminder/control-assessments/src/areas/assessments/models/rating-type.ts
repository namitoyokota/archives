export class RatingType {
  constructor(public id = false, public name = "", public isSelected = false) {}

  static create(item: RatingType = null, preserveNull = false): RatingType {
    return item == null
      ? preserveNull
        ? null
        : new RatingType()
      : new RatingType(item.id, item.name, item.isSelected);
  }
}
