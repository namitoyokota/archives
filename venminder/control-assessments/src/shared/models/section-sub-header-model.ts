export class SectionSubHeaderModel {
  constructor(
    public sortId: number = 0,
    public sectionId: number = 0,
    public value: string = null,
    public validSubHeader: boolean = true
  ) {}
  static create(
    item: SectionSubHeaderModel = null,
    preserveNull = false
  ): SectionSubHeaderModel {
    return item == null
      ? preserveNull
        ? null
        : new SectionSubHeaderModel()
      : new SectionSubHeaderModel(
          item.sortId,
          item.sectionId,
          item.value,
          item.validSubHeader
        );
  }
}
