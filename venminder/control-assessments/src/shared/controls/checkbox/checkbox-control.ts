import { inject } from "aurelia-dependency-injection";
import { DialogCloseResult, DialogService } from "aurelia-dialog";
import { EventAggregator } from "aurelia-event-aggregator";
import { AssessmentSectionControl } from "services/models/assessments/assessment-section-control";
import { SectionControl } from "services/models/templates/section-control";
import { ConfirmDialog } from "shared-from-dcdev/shared/dialogs/confirm-dialog/confirm-dialog.component";
import { Guid } from "shared-from-dcdev/shared/utilities/guid";
import { ConfirmDeleteDialogFactory } from "shared/dialogs/confirm-delete-dialog-factory";
import { AnswerOption } from "shared/models/answer-option";
import { EventNames } from "../../event-names";
import { BaseControl } from "../base/base-control";

export class CheckboxControl extends BaseControl {
  private itemID = 0;

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

    this.itemID = 3;
  }

  /** Adds a new answer option */
  addOption(): void {
    this.itemID += 1;
    this.model.answerOptions.push(new AnswerOption(this.itemID, ""));
    this.answerOptionsChanged();
  }

  /** Deletes an answer option */
  deleteOption(id: number): void {
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

  /** Emit event when answer option changed */
  answerOptionsChanged() {
    this.ea.publish(
      EventNames.Controls.ANSWER_LIST_CHANGED,
      this.model.answerOptions
    );
  }

  /** Generates unique id  */
  generateGuid(): string {
    return Guid.newGuid().toString();
  }

  /** Triggered on checkbox toggle */
  selectedAnswerChanged() {
    this.model.errorMsg = "";
  }
}
