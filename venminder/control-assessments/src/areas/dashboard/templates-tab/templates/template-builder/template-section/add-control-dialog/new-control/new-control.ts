import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { inject, NewInstance } from "aurelia-framework";
import { ValidationController, ValidationRules } from "aurelia-validation";
import { ControlService } from "services/control-service";
import { ControlType } from "services/interfaces/control-type";
import { ControlRequest } from "services/models/controls/control-request";
import { SectionControl } from "services/models/templates/section-control";
import { DropdownDisplayTypes } from "shared/enums/dropdown-display-types";
import { EventNames } from "shared/event-names";
import { AnswerOption } from "shared/models/answer-option";
import { ControlTags } from "../control-tags/control-tags";

export class NewControl {
  controlQuestion = "";
  controlName = "";
  controlDescription = "";
  visible = false;
  selectedDisplayAsDropdownItem: ControlType;
  displayAsModel: SectionControl = null;
  readonly displayAsDropdownItems: ControlType[] = DropdownDisplayTypes;
  private answerListChanged: Subscription = null;
  private answerOptions: AnswerOption[] = [];

  constructor(
    @inject(ControlTags) private readonly controlTags: ControlTags,
    @inject(ControlService) private readonly controlService: ControlService,
    @inject(EventAggregator) private readonly ea: EventAggregator,
    @inject(NewInstance.of(ValidationController))
    private readonly validationController: ValidationController
  ) {
    ValidationRules.ensure((m: NewControl) => m.controlName)
      .displayName("Control name")
      .required()
      .ensure((m: NewControl) => m.selectedDisplayAsDropdownItem)
      .displayName("Display type")
      .required()
      .on(this);
  }

  attached(): void {
    this.attachSubscriptions();
  }

  detached(): void {
    this.detachSubscriptions();
  }

  showForm(): void {
    this.visible = true;
  }

  clear(): void {
    this.controlQuestion = "";
    this.controlName = "";
    this.controlDescription = "";
    this.clearDisplayDropdown();
    this.displayAsModel = null;
    this.answerOptions = [];
    this.controlTags.clear();
    this.validationController.reset();
    this.hideForm();
  }

  displayAsItemSelected($event): void {
    const selectedIndex = this.displayAsDropdownItems.findIndex(
      (x) => x.id == $event
    );
    this.displayAsDropdownItems.map(function (x) {
      x.isSelected = false;
      return x;
    });
    this.displayAsDropdownItems[selectedIndex].isSelected = true;
    this.selectedDisplayAsDropdownItem = this.displayAsDropdownItems[
      selectedIndex
    ].isSelected
      ? this.displayAsDropdownItems[selectedIndex]
      : this.selectedDisplayAsDropdownItem;

    this.displayAsModel = new SectionControl(
      null,
      false,
      false,
      "Control Name",
      "Question",
      "Description",
      this.displayAsDropdownItems[selectedIndex].displayType,
      [],
      []
    );
  }

  async save(): Promise<void> {
    const validateResult = await this.validationController.validate();
    if (validateResult.valid) {
      await this.controlService.saveControl(
        new ControlRequest(
          this.controlName.trim(),
          this.controlQuestion.trim(),
          this.controlDescription,
          this.selectedDisplayAsDropdownItem.displayType,
          this.controlTags.getAll(),
          this.answerOptions
        )
      );
      this.ea.publish(EventNames.Controls.REFRESH_LIST);
      this.clear();
      this.hideForm();
    }
  }

  private attachSubscriptions(): void {
    if (this.answerListChanged === null) {
      this.answerListChanged = this.ea.subscribe(
        EventNames.Controls.ANSWER_LIST_CHANGED,
        (data: AnswerOption[]) => {
          this.answerOptions = data;
        }
      );
    }
  }

  private detachSubscriptions(): void {
    if (this.answerListChanged !== null) {
      this.answerListChanged.dispose();
      this.answerListChanged = null;
    }
  }

  private clearDisplayDropdown(): void {
    this.displayAsDropdownItems.map(function (x) {
      x.isSelected = false;
      return x;
    });
    this.selectedDisplayAsDropdownItem = null;
  }

  private hideForm(): void {
    this.visible = false;
  }
}
