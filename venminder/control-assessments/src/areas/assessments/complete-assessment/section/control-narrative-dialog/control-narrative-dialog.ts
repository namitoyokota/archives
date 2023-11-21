import { ControlNarrativeModel } from "areas/assessments/models/control-narrative-model";
import { DialogController } from "aurelia-dialog";
import { computedFrom, inject } from "aurelia-framework";
import { ControlType } from "services/interfaces/control-type";
import { DropdownDisplayTypes } from "shared/enums/dropdown-display-types";

export class ControlNarrativeDialog {
  model: ControlNarrativeModel;
  displayType: ControlType;
  narrative: string;
  readonly isFirst = true; // Used by control component

  @computedFrom("narrative", "model.controlModel.answers.length")
  get canSave(): boolean {
    return (
      this.narrative?.trim().length !== 0 ||
      this.model.controlModel.answers.length !== 0
    );
  }

  constructor(
    @inject(DialogController)
    private readonly dialogController: DialogController
  ) {}

  activate(model: ControlNarrativeModel): void {
    this.model = model;
    this.displayType = DropdownDisplayTypes.find(
      (x) => x.displayType == model.controlModel.displayType
    );
    this.narrative = model.controlModel.narrative;
  }

  submit(): void {
    this.model.controlModel.narrative = this.narrative.trim();
    this.dialogController.ok(this.model.controlModel);
  }
}
