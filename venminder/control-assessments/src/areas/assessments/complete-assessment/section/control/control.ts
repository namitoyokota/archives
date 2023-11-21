import { inject } from "aurelia-dependency-injection";
import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { bindable } from "aurelia-framework";
import { EventNames } from "shared/event-names";
import { DynamicControl } from "shared/models/dynamic-control";

export class AssessmentSectionControl {
  @bindable item: DynamicControl = null;
  @bindable sectionId: string;
  @bindable isFirst: boolean;

  private errorListener: Subscription = null;

  constructor(@inject(EventAggregator) private readonly ea: EventAggregator) {}

  attached(): void {
    this.errorListener = this.ea.subscribe(
      EventNames.Assessments.CONTROL_INVALID +
        ":" +
        this.sectionId +
        ":" +
        this.item.sortId,
      () => {
        this.item.model.errorMsg = "Please complete this control.";
      }
    );
  }

  detached(): void {
    if (this.errorListener != null) {
      this.errorListener.dispose();
      this.errorListener = null;
    }
  }
}
