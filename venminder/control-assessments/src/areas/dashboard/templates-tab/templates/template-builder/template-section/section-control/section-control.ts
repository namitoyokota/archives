import { VMTooltipTextOptions } from "@venminder/vm-library";
import { SectionControlModel } from "areas/dashboard/models/section-control-model";
import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { bindable, inject } from "aurelia-framework";
import { EventNames } from "shared/event-names";
import { AnswerOption } from "shared/models/answer-option";

export class SectionControl {
  @bindable model: SectionControlModel = null;

  controlText = "";
  answerOptions: AnswerOption[] = [];
  groupControls = false;
  scoringErrors: string[] = [];

  readonly vmTooltipTextOptions: VMTooltipTextOptions = {
    hyphens: "",
    "max-width": "500px",
    overflow: "",
    "overflow-wrap": "",
    "white-space": "",
    "word-break": "",
  };

  readonly toolTipText =
    "Check this box if you want to group this radio button into a table with the radio button control above it. <br />Only use this if the controls have the same answer options.";

  private eventSections: Subscription = null;
  private eventInvalid: Subscription = null;

  constructor(@inject(EventAggregator) private readonly ea: EventAggregator) {}

  attached(): void {
    if (this.model != null) {
      this.groupControls = this.model.groupControls;

      if (this.model.question != null && this.model.question.length > 0) {
        this.controlText = this.model.question + " - " + this.model.name;
      } else {
        this.controlText = this.model.name;
      }

      switch (this.model.displayType) {
        case "TEXTFIELD":
          this.answerOptions.push(new AnswerOption(1, "Text Area"));
          break;
        case "DATE":
          this.answerOptions.push(new AnswerOption(1, "Date Field"));
          break;
        default:
          this.answerOptions = this.model.answerOptions.sort((a, b) =>
            a.id > b.id ? 1 : -1
          );
      }

      this.attachSubscriptions();
    }
  }

  detached(): void {
    this.detachSubscriptions();
  }

  groupControlsSelected(): void {
    this.model.groupControls = this.groupControls;
  }

  toggleScore(item: number): void {
    const answerIndex = this.model.answerOptions.findIndex((x) => x.id == item);
    const answer = this.model.answerOptions[answerIndex];
    answer.calculateScore = !answer.calculateScore;
  }

  private attachSubscriptions(): void {
    if (this.eventSections == null) {
      this.eventSections = this.ea.subscribe(
        EventNames.Templates.SECTION_MODIFIED,
        () => {
          this.groupControls = this.model.groupControls;
        }
      );
    }

    if (this.eventInvalid == null) {
      this.eventInvalid = this.ea.subscribe(
        `${EventNames.Templates.CONTROL_INVALID}:${this.model.sectionId}:${this.model.sortId}`,
        () => {
          if (!this.model.validScore) {
            this.scoringErrors = [];
            this.scoringErrors.push(
              "Score is required for items marked to be used in calculating score"
            );
          } else {
            this.scoringErrors = [];
          }
        }
      );
    }
  }

  private detachSubscriptions(): void {
    if (this.eventSections != null) {
      this.eventSections.dispose();
      this.eventSections = null;
    }

    if (this.eventInvalid != null) {
      this.eventInvalid.dispose();
      this.eventInvalid = null;
    }
  }

  get displayType() {
    switch (this.model.displayType) {
      case "RADIO_YES_NO":
      case "RADIO_MENTIONED":
        return "radio";
      case "CHECKBOX":
        return "checkbox";
      case "DROPDOWN":
        return "dropdown";
      default:
        return "text";
    }
  }
}
