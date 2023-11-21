import { DialogCloseResult, DialogService } from "aurelia-dialog";
import { EventAggregator } from "aurelia-event-aggregator";
import { inject, observable } from "aurelia-framework";
import { AssessmentSectionControl } from "services/models/assessments/assessment-section-control";
import { SectionControl } from "services/models/templates/section-control";
import { ConfirmDialog } from "shared-from-dcdev/shared/dialogs/confirm-dialog/confirm-dialog.component";
import { ConfirmDeleteDialogFactory } from "shared/dialogs/confirm-delete-dialog-factory";
import { AnswerOption } from "shared/models/answer-option";
import { EventNames } from "../../event-names";
import { BaseControl } from "../base/base-control";

export class DropdownControl extends BaseControl {
  @observable private selectedAnswer: AnswerOption = null;
  private itemID = 0;
  private placeholderAnswer: AnswerOption = new AnswerOption(0, "Select...");

  constructor(
    @inject(EventAggregator) protected readonly ea: EventAggregator,
    @inject(DialogService) private readonly dialogService: DialogService
  ) {
    super(ea);
  }

  activate(model: SectionControl | AssessmentSectionControl) {
    super.activate(model);

    if (this.model.answerOptions.length == 0) {
      this.model.answerOptions = [
        new AnswerOption(1, ""),
        new AnswerOption(2, ""),
      ];
    }
    this.itemID = this.model.answerOptions.length;

    if (super.isAssessmentSectionControl()) {
      // Despite the error squigglies, this works fine
      if (this.model.answers.length && this.model.answers[0] != "0") {
        this.selectedAnswer = this.model.answerOptions.find(
          (x) => x.id.toString() == this.model.answers[0]
        );
      } else {
        this.selectedAnswer = this.placeholderAnswer;
      }
    }
  }

  /** Used to identity answer options */
  answerMatcher = (a, b) => a.id === b.id;

  /** Adds a new option to answer list */
  addOption() {
    this.itemID += 1;
    this.model.answerOptions.push(new AnswerOption(this.itemID, ""));
    this.answerOptionsChanged();
  }

  /** Deletes answer option from list */
  deleteOption(id: number) {
    this.dialogService
      .open({
        viewModel: ConfirmDialog,
        model: ConfirmDeleteDialogFactory.create("selection"),
      })
      .whenClosed(async (response: DialogCloseResult) => {
        if (!response.wasCancelled) {
          if (this.model.answerOptions.length > 1) {
            const selectedIndex = this.model.answerOptions.findIndex(
              (x) => x.id == id
            );
            this.model.answerOptions.splice(selectedIndex, 1);
            this.answerOptionsChanged();
          }
        }
      });
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

      if (this.selectedAnswer != null && this.selectedAnswer.id != 0) {
        this.model.answers.push(this.selectedAnswer.id.toString());
        this.model.errorMsg = "";
      }
    }
  }
}
