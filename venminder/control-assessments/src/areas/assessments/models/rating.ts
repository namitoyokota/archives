export class Rating {
  constructor(
    public id: number = 0,
    public name: string = "",
    public color: string = "",
    public isSelected: boolean = false,
    public displayText: string = `<i class="fa fa-circle icon-${color}"></i> &nbsp;&nbsp; ${name}`
  ) {}

  static create(item: Rating = null, preserveNull = false): Rating {
    return item == null
      ? preserveNull
        ? null
        : new Rating()
      : new Rating(
          item.id,
          item.name,
          item.color,
          item.isSelected,
          item.displayText
        );
  }
}
