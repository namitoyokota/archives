import { AnswerOption } from "shared/models/answer-option";

export class SectionControlModel {
  constructor(
    public sortId: number = 0,
    public sectionId: number = 0,
    public name: string = null,
    public question: string = null,
    public description: string = null,
    public displayType: string = "",
    public answerOptions: AnswerOption[] = [],
    public enableGroupControls: boolean = false,
    public groupControls: boolean = false,
    public validScore: boolean = true
  ) {}
  static create(
    item: SectionControlModel = null,
    preserveNull = false
  ): SectionControlModel {
    return item == null
      ? preserveNull
        ? null
        : new SectionControlModel()
      : new SectionControlModel(
          item.sortId,
          item.sectionId,
          item.name,
          item.question,
          item.description,
          item.displayType,
          item.answerOptions,
          item.enableGroupControls,
          item.groupControls,
          item.validScore
        );
  }
}
