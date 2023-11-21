import { EventAggregator } from "aurelia-event-aggregator";
import { inject, observable } from "aurelia-framework";
import { AssessmentSectionControl } from "services/models/assessments/assessment-section-control";
import { SectionControl } from "services/models/templates/section-control";
import { BaseControl } from "../base/base-control";

export class TextBoxControl extends BaseControl {
  @observable private selectedAnswer = "";

  constructor(@inject(EventAggregator) protected readonly ea: EventAggregator) {
    super(ea);
  }

  activate(model: SectionControl | AssessmentSectionControl) {
    super.activate(model);

    if (super.isAssessmentSectionControl()) {
      // Despite the error squigglies, this works fine
      this.selectedAnswer = model.answers[0];
    }
  }

  /** Triggered on observable selectedAnswer change */
  selectedAnswerChanged() {
    // Despite the error squigglies, this works fine
    if (this.model) {
      this.model.answers = [];

      if (this.selectedAnswer != null) {
        this.selectedAnswer = this.selectedAnswer.trim();
        if (this.selectedAnswer.length > 0) {
          this.model.answers.push(this.selectedAnswer);
          this.model.errorMsg = "";
        }
      }
    }
  }
}
