import { inject } from "aurelia-dependency-injection";
import { EventAggregator } from "aurelia-event-aggregator";
import { AssessmentSectionControl } from "services/models/assessments/assessment-section-control";
import { SectionControl } from "services/models/templates/section-control";
import { EventNames } from "../../event-names";

export class BaseControl {
  protected model: SectionControl | AssessmentSectionControl = null;

  constructor(
    @inject(EventAggregator) protected readonly ea: EventAggregator
  ) {}

  activate(model: SectionControl | AssessmentSectionControl = null) {
    this.model = model;
  }

  /** Checks if model is of type assessment section control */
  protected isAssessmentSectionControl(): boolean {
    if (this.model instanceof AssessmentSectionControl || this.model?.answers) {
      return true;
    } else {
      return false;
    }
  }

  /** Sends event for caret button clicked */
  protected caretButtonClicked() {
    this.ea.publish(
      `${EventNames.Controls.CARET_BUTTON_CLICKED}:${this.model.sectionId}`,
      this.model
    );
  }
}
