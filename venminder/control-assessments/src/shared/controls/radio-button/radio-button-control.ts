import { EventAggregator } from "aurelia-event-aggregator";
import { inject, observable } from "aurelia-framework";
import { AssessmentSectionControl } from "services/models/assessments/assessment-section-control";
import { SectionControl } from "services/models/templates/section-control";
import { Guid } from "shared-from-dcdev/shared/utilities/guid";
import { AnswerOption } from "shared/models/answer-option";
import { EventNames } from "../../event-names";
import { BaseControl } from "../base/base-control";

export class RadioButtonControl extends BaseControl {
  @observable private selectedAnswer = "";

  constructor(@inject(EventAggregator) protected readonly ea: EventAggregator) {
    super(ea);
  }

  activate(model: SectionControl | AssessmentSectionControl) {
    super.activate(model);

    if (super.isAssessmentSectionControl()) {
      this.selectedAnswer = model.answers[0]; // Despite the error squigglies, this works fine
    }

    if (this.model.answerOptions.length == 0) {
      switch (this.model.displayType) {
        case "RADIO_YES_NO":
          this.model.answerOptions = [
            new AnswerOption(4, "N/P"),
            new AnswerOption(3, "N/A"),
            new AnswerOption(2, "No"),
            new AnswerOption(1, "Yes"),
          ];
          break;
        case "RADIO_MENTIONED":
          this.model.answerOptions = [
            new AnswerOption(4, "N/P"),
            new AnswerOption(3, "N/A"),
            new AnswerOption(2, "Tested"),
            new AnswerOption(1, "Mentioned"),
          ];
          break;
      }

      this.answerOptionsChanged();
    }

    this.model.answerOptions = this.model.answerOptions.sort((a, b) =>
      a.id > b.id ? 1 : -1
    );
  }

  /** Sends event when answer options list changes */
  answerOptionsChanged() {
    this.ea.publish(
      EventNames.Controls.ANSWER_LIST_CHANGED,
      this.model.answerOptions
    );
  }

  /** Triggered on observable selectedAnswer change */
  selectedAnswerChanged() {
    // Despite the error squigglies, this works fine
    if (this.model) {
      this.model.answers = [];

      if (this.selectedAnswer != null && this.selectedAnswer.length > 0) {
        this.model.answers.push(this.selectedAnswer);
        this.model.errorMsg = "";
      }
    }
  }

  /** Generates unique id  */
  generateGuid(): string {
    return Guid.newGuid().toString();
  }
}
