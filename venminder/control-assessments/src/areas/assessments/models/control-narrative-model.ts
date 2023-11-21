import { AssessmentSectionControl } from "services/models/assessments/assessment-section-control";

export class ControlNarrativeModel {
  constructor(
    public controlModel: AssessmentSectionControl = null,
    public sectionTitle: string = ""
  ) {}

  static create(
    item: ControlNarrativeModel = null,
    preserveNull = false
  ): ControlNarrativeModel {
    return item == null
      ? preserveNull
        ? null
        : new ControlNarrativeModel()
      : new ControlNarrativeModel(item.controlModel, item.sectionTitle);
  }
}
