export class DynamicControl {
  constructor(
    public type: string = null,
    public sortId: number = 0,
    public model: any = null
  ) {}

  static create(
    item: DynamicControl = null,
    preserveNull: boolean = false
  ): DynamicControl {
    return item == null
      ? preserveNull
        ? null
        : new DynamicControl()
      : new DynamicControl(item.type, item.sortId, item.model);
  }
}
