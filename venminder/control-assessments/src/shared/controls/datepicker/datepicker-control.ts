import { EventAggregator } from "aurelia-event-aggregator";
import { inject, observable } from "aurelia-framework";
import moment from "moment";
import { AssessmentSectionControl } from "services/models/assessments/assessment-section-control";
import { SectionControl } from "services/models/templates/section-control";
import { BaseControl } from "../base/base-control";

export class DatepickerControl extends BaseControl {
  @observable selectedAnswer: Date;

  constructor(@inject(EventAggregator) protected readonly ea: EventAggregator) {
    super(ea);
  }

  activate(model: SectionControl | AssessmentSectionControl) {
    super.activate(model);

    if (super.isAssessmentSectionControl()) {
      // Despite the error squigglies, this works fine
      if (this.model.answers.length) {
        this.selectedAnswer = moment(model.answers[0]).toDate();
      } else {
        this.selectedAnswer = null;
      }
    }
  }

  /** Triggered on observable selectedAnswer change */
  selectedAnswerChanged() {
    // Despite the error squigglies, this works fine
    if (this.model) {
      this.model.answers = [];

      if (this.selectedAnswer != null) {
        this.model.answers.push(this.selectedAnswer.toString("MM/DD/YYYY"));
        this.model.errorMsg = "";
      }
    }
  }
}
