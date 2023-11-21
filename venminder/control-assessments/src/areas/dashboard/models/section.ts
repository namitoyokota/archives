import { DynamicControl } from "shared/models/dynamic-control";

export class Section {
  constructor(
    public id: number = 0,
    public title: string = null,
    public hasSectionRating: boolean = true,
    public controlsAndSubheaders: DynamicControl[] = [],
    public validTitle: boolean = true
  ) {}
  static create(item: Section = null, preserveNull = false): Section {
    return item == null
      ? preserveNull
        ? null
        : new Section()
      : new Section(
          item.id,
          item.title,
          item.hasSectionRating,
          item.controlsAndSubheaders,
          item.validTitle
        );
  }
}
